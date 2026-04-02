import { zValidator } from "@hono/zod-validator";
import { createDB } from "@repo/db";
import { invitation, user } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../app";
import { generateSignedUrlAsync } from "../lib/signing";
import { ensureAdmin, getSession } from "../middleware/auth";

const app = new Hono<{ Bindings: Env }>();
const MAX_BASE64_LENGTH = 13_653_333; // ~10MB decoded

const uploadSchema = z.object({
  fileName: z.string(),
  fileType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]),
  base64: z.string().max(MAX_BASE64_LENGTH),
});

async function notifyOnboardingDO(env: Env, inviteCode: string): Promise<void> {
  try {
    const doId = env.ONBOARDING_DO.idFromName(inviteCode);
    const stub = env.ONBOARDING_DO.get(doId);
    await stub.fetch("https://do/notify");
  } catch {
    // DO notification is best-effort
  }
}

async function findInviteAndNotify(
  env: Env,
  db: ReturnType<typeof createDB>,
  userId: string,
): Promise<void> {
  const users = await db
    .select({ noKamar: user.noKamar })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const noKamar = users[0]?.noKamar;
  if (!noKamar) return;

  const invites = await db
    .select({ code: invitation.code })
    .from(invitation)
    .where(eq(invitation.noKamar, noKamar))
    .limit(1);

  if (invites[0]) {
    await notifyOnboardingDO(env, invites[0].code);
  }
}

function extractKeyFromUrl(url: string): string | null {
  // URL format: https://api.kost.iydheko.site/files/ktp/xxx?token=...&expires=...
  // or: https://api.kost.iydheko.site/files/ktp/xxx
  const match = url.match(/\/files\/([^?]+)/);
  return match ? match[1] : null;
}

app.post("/ktp", zValidator("json", uploadSchema), async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const parsed = uploadSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  // Convert base64 back to buffer
  const buffer = Uint8Array.from(atob(parsed.data.base64), (c) =>
    c.charCodeAt(0),
  );

  // Create unique key for R2
  const key = `ktp/${session.user.id}-${Date.now()}-${parsed.data.fileName}`;

  // Upload to R2
  await c.env.R2_BUCKET.put(key, buffer, {
    httpMetadata: { contentType: parsed.data.fileType },
  });

  // Generate signed URL (24 hour expiry)
  const url = await generateSignedUrlAsync(c.env, key);

  // Update user profile
  const db = createDB(c.env.DATABASE_URL);
  await db
    .update(user)
    .set({ ktp: url, ktpStatus: "pending", ktpRejectionReason: null })
    .where(eq(user.id, session.user.id));

  // Notify the owner's DO
  await findInviteAndNotify(c.env, db, session.user.id);

  return c.json({ url });
});

app.post("/bukti", zValidator("json", uploadSchema), async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const parsed = uploadSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const buffer = Uint8Array.from(atob(parsed.data.base64), (c) =>
    c.charCodeAt(0),
  );

  const key = `bukti/${session.user.id}-${Date.now()}-${parsed.data.fileName}`;

  await c.env.R2_BUCKET.put(key, buffer, {
    httpMetadata: { contentType: parsed.data.fileType },
  });

  const url = await generateSignedUrlAsync(c.env, key);

  return c.json({ url });
});

app.post("/avatar", zValidator("json", uploadSchema), async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const parsed = uploadSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const buffer = Uint8Array.from(atob(parsed.data.base64), (c) =>
    c.charCodeAt(0),
  );

  const key = `avatar/${session.user.id}-${Date.now()}-${parsed.data.fileName}`;

  await c.env.R2_BUCKET.put(key, buffer, {
    httpMetadata: { contentType: parsed.data.fileType },
  });

  const url = await generateSignedUrlAsync(c.env, key);

  const db = createDB(c.env.DATABASE_URL);
  await db.update(user).set({ image: url }).where(eq(user.id, session.user.id));

  return c.json({ url });
});

const verifyKtpSchema = z.object({
  noKamar: z.number().int().min(1).max(12),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

app.put(
  "/ktp/verify",
  ensureAdmin,
  zValidator("json", verifyKtpSchema),
  async (c) => {
    const db = createDB(c.env.DATABASE_URL);
    const parsed = verifyKtpSchema.safeParse(c.req.valid("json"));

    if (!parsed.success) {
      return c.json({ error: z.prettifyError(parsed.error) }, 400);
    }

    const { noKamar, status, reason } = parsed.data;

    // Get user's current KTP URL before updating
    const currentUser = await db
      .select({ id: user.id, ktp: user.ktp })
      .from(user)
      .where(eq(user.noKamar, noKamar))
      .limit(1);

    if (!currentUser[0]) {
      return c.json({ error: "Penghuni tidak ditemukan" }, 404);
    }

    await db
      .update(user)
      .set({
        ktpStatus: status,
        ktpRejectionReason: status === "rejected" ? (reason ?? null) : null,
        onboarding: status === "approved" ? "bayar_tagihan" : null,
        ktp: status === "rejected" ? null : currentUser[0].ktp,
      })
      .where(eq(user.noKamar, noKamar));

    // Delete rejected KTP photo from R2
    if (status === "rejected" && currentUser[0].ktp) {
      const key = extractKeyFromUrl(currentUser[0].ktp);
      if (key) {
        console.log("[UPLOAD] Deleting rejected KTP from R2:", key);
        await c.env.R2_BUCKET.delete(key);
      }
    }

    // Notify the DO
    const invites = await db
      .select({ code: invitation.code })
      .from(invitation)
      .where(eq(invitation.noKamar, noKamar))
      .limit(1);

    if (invites[0]) {
      await notifyOnboardingDO(c.env, invites[0].code);
    }

    return c.json({ success: true });
  },
);

export default app;
