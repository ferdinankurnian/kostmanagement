import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import type { Env } from "../auth-worker";
import { createDB } from "../db";
import { invitation, user } from "../db/schema/auth";
import { kamar } from "../db/schema/kamar";
import { settings } from "../db/schema/settings";
import { tagihan } from "../db/schema/tagihan";
import { ensureAdmin, getSession } from "../middleware/auth";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
const createInviteSchema = z.object({
  name: z.string().min(1),
  noKamar: z.number().min(1).max(12),
});
const codeSchema = z.object({ code: z.string() });

const app = new Hono<{ Bindings: Env }>();

// admin buat invitation
app.post(
  "/",
  ensureAdmin,
  zValidator("json", createInviteSchema),
  async (c) => {
    const db = createDB(c.env.DATABASE_URL);
    const parsed = createInviteSchema.safeParse(c.req.valid("json"));
    if (!parsed.success) {
      return c.json({ error: z.prettifyError(parsed.error) }, 400);
    }

    await db
      .update(kamar)
      .set({ status: "booked", updatedAt: new Date() })
      .where(eq(kamar.nomor, parsed.data.noKamar));

    const result = await db
      .insert(invitation)
      .values({
        id: generateCode(),
        code: generateCode(),
        name: parsed.data.name,
        noKamar: parsed.data.noKamar,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .returning();

    return c.json(result[0]);
  },
);

// penghuni validasi code sebelum signup
app.post("/validate", zValidator("json", codeSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const parsed = codeSchema.safeParse(c.req.valid("json"));
  if (!parsed.success) {
    return c.json({ error: "Code diperlukan" }, 400);
  }

  const code = parsed.data.code.toUpperCase();

  const result = await db
    .select()
    .from(invitation)
    .where(eq(invitation.code, code));

  const inv = result[0];
  if (!inv) return c.json({ error: "Kode tidak ditemukan" }, 404);
  if (inv.isUsed) return c.json({ error: "Kode sudah digunakan" }, 400);

  if (new Date(inv.expiredAt).getTime() < Date.now()) {
    return c.json({ error: "Kode sudah kadaluarsa" }, 400);
  }

  return c.json(inv);
});

// dipanggil setelah signup sukses
app.post("/use", zValidator("json", codeSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const parsed = codeSchema.safeParse(c.req.valid("json"));
  if (!parsed.success) {
    return c.json({ error: "Code diperlukan" }, 400);
  }

  const code = parsed.data.code.toUpperCase();
  const session = await getSession(c);

  if (!session) return c.json({ error: "Anda harus login dulu" }, 401);

  const result = await db
    .select()
    .from(invitation)
    .where(eq(invitation.code, code));

  const inv = result[0];
  if (!inv) return c.json({ error: "Kode tidak ditemukan" }, 404);
  if (inv.isUsed) return c.json({ error: "Kode sudah digunakan" }, 400);

  if (new Date(inv.expiredAt).getTime() < Date.now()) {
    return c.json({ error: "Kode sudah kadaluarsa" }, 400);
  }

  // 1. Matikan kode
  await db
    .update(invitation)
    .set({ isUsed: true })
    .where(eq(invitation.code, code));

  // 2. Update status kamar
  await db
    .update(kamar)
    .set({ status: "terisi", updatedAt: new Date() })
    .where(eq(kamar.nomor, inv.noKamar));

  // 3. Link user ke kamar dan set role + onboarding
  await db
    .update(user)
    .set({ noKamar: inv.noKamar, role: "user", onboarding: "greeting" })
    .where(eq(user.id, session.user.id));

  // 4. Auto-create tagihan pertama
  const hargaRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "harga_sewa"))
    .limit(1);

  const hargaSewa = parseInt(hargaRow[0]?.value ?? "0");

  if (hargaSewa > 0) {
    const now = new Date();
    const periode = new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(now);

    await db.insert(tagihan).values({
      noKamar: inv.noKamar,
      userId: session.user.id,
      jumlah: hargaSewa,
      periode,
      tanggalJatuhTempo: new Date(now.getFullYear(), now.getMonth(), 10),
    });
  }

  return c.json({ success: true });
});

// get invite by id (admin only)
app.get("/:id", ensureAdmin, async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const id = c.req.param("id") as string;

  const result = await db
    .select()
    .from(invitation)
    .where(eq(invitation.id, id));

  return c.json(result[0] ?? null);
});

export default app;
