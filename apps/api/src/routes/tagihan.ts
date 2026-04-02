import { zValidator } from "@hono/zod-validator";
import { createDB } from "@repo/db";
import { invitation, settings, tagihan, user } from "@repo/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../app";
import { getSession } from "../middleware/auth";

function extractKeyFromUrl(url: string): string | null {
  // URL format: https://api.kost.iydheko.site/files/ktp/xxx?token=...&expires=...
  // or: https://api.kost.iydheko.site/files/ktp/xxx
  const match = url.match(/\/files\/([^?]+)/);
  return match ? match[1] : null;
}

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
  noKamar: number,
): Promise<void> {
  const invites = await db
    .select({ code: invitation.code })
    .from(invitation)
    .where(eq(invitation.noKamar, noKamar))
    .limit(1);

  if (invites[0]) {
    await notifyOnboardingDO(env, invites[0].code);
  }
}

const app = new Hono<{ Bindings: Env }>();
const createTagihanSchema = z.object({
  noKamar: z.number(),
  jumlah: z.number(),
  periode: z.string(),
  tanggalJatuhTempo: z.string(),
});
const submitTagihanSchema = z.object({
  metodePembayaran: z.enum(["cash", "transfer"]),
  buktiPembayaran: z.string(),
  monthsPaid: z.number().min(1).max(12).optional(),
});
const rejectTagihanSchema = z.object({ alasan: z.string() });

app.get("/", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const role = session.user.role;
  const noKamar = (session.user as { noKamar?: number | null }).noKamar;

  let rows: (typeof tagihan.$inferSelect & { namaPenghuni: string | null })[];

  if (role === "admin") {
    const tagihanRows = await db
      .select({
        tagihan,
        namaPenghuni: user.name,
      })
      .from(tagihan)
      .leftJoin(user, eq(tagihan.userId, user.id));
    rows = tagihanRows.map((row) => ({
      ...row.tagihan,
      namaPenghuni: row.namaPenghuni,
    }));
  } else if (noKamar) {
    const tagihanRows = await db
      .select({
        tagihan,
        namaPenghuni: user.name,
      })
      .from(tagihan)
      .leftJoin(user, eq(tagihan.userId, user.id))
      .where(eq(tagihan.noKamar, noKamar));
    rows = tagihanRows.map((row) => ({
      ...row.tagihan,
      namaPenghuni: row.namaPenghuni,
    }));
  } else {
    rows = [];
  }

  return c.json(rows);
});

app.get("/:id", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const rows = await db
    .select({
      tagihan,
      namaPenghuni: user.name,
    })
    .from(tagihan)
    .leftJoin(user, eq(tagihan.userId, user.id))
    .where(eq(tagihan.id, id))
    .limit(1);

  if (!rows[0]) {
    return c.json({ error: "Tagihan tidak ditemukan" }, 404);
  }

  if (
    session.user.role !== "admin" &&
    rows[0].tagihan.userId !== session.user.id
  ) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({
    ...rows[0].tagihan,
    namaPenghuni: rows[0].namaPenghuni,
  });
});

app.post("/", zValidator("json", createTagihanSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const parsed = createTagihanSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  // Find the penghuni for this room
  const penghuni = await db
    .select()
    .from(user)
    .where(eq(user.noKamar, parsed.data.noKamar))
    .limit(1);

  if (!penghuni[0]) {
    return c.json({ error: "Tidak ada penghuni di kamar ini" }, 400);
  }

  const [created] = await db
    .insert(tagihan)
    .values({
      noKamar: parsed.data.noKamar,
      userId: penghuni[0].id,
      jumlah: parsed.data.jumlah,
      periode: parsed.data.periode,
      tanggalJatuhTempo: new Date(parsed.data.tanggalJatuhTempo),
    })
    .returning();

  return c.json(created, 201);
});

app.post("/generate", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // Read harga_sewa from settings
  const hargaRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "harga_sewa"))
    .limit(1);

  const hargaSewa = parseInt(hargaRow[0]?.value ?? "0");

  // Get all active penghuni (role=user with noKamar)
  const penghuniList = await db
    .select()
    .from(user)
    .where(and(eq(user.role, "user"), isNotNull(user.noKamar)));

  const now = new Date();
  const periode = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(now);

  const jatuhTempo = new Date(now.getFullYear(), now.getMonth(), 10);

  const created: (typeof tagihan.$inferSelect)[] = [];

  for (const p of penghuniList) {
    if (!p.noKamar) continue;

    // Check if tagihan for this periode already exists
    const existing = await db
      .select()
      .from(tagihan)
      .where(and(eq(tagihan.noKamar, p.noKamar), eq(tagihan.periode, periode)))
      .limit(1);

    if (existing[0]) continue;

    const [t] = await db
      .insert(tagihan)
      .values({
        noKamar: p.noKamar,
        userId: p.id,
        jumlah: hargaSewa,
        periode,
        tanggalJatuhTempo: jatuhTempo,
      })
      .returning();

    created.push(t);
  }

  return c.json({ created: created.length, tagihan: created }, 201);
});

app.put("/:id/submit", zValidator("json", submitTagihanSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const parsed = submitTagihanSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  // Verify the tagihan belongs to this user
  const existing = await db
    .select()
    .from(tagihan)
    .where(eq(tagihan.id, id))
    .limit(1);

  if (!existing[0]) {
    return c.json({ error: "Tagihan tidak ditemukan" }, 404);
  }

  if (existing[0].userId !== session.user.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const [updated] = await db
    .update(tagihan)
    .set({
      metodePembayaran: parsed.data.metodePembayaran,
      buktiPembayaran: parsed.data.buktiPembayaran,
      monthsPaid: parsed.data.monthsPaid ?? 1,
      status: "menunggu_verifikasi",
      alasanPenolakan: null,
      tanggalBayar: new Date(),
    })
    .where(eq(tagihan.id, id))
    .returning();

  // Notify the owner's DO
  await findInviteAndNotify(c.env, db, existing[0].noKamar);

  return c.json(updated);
});

app.put("/:id/accept", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");

  const [updated] = await db
    .update(tagihan)
    .set({ status: "lunas" })
    .where(eq(tagihan.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Tagihan tidak ditemukan" }, 404);
  }

  // Set bayarSampai based on monthsPaid
  const monthsPaid = updated.monthsPaid ?? 1;
  const bayarSampai = new Date(updated.tanggalJatuhTempo);
  bayarSampai.setMonth(bayarSampai.getMonth() + monthsPaid);

  await db.update(user).set({ bayarSampai }).where(eq(user.id, updated.userId));

  // Notify the tenant's DO
  await findInviteAndNotify(c.env, db, updated.noKamar);

  return c.json(updated);
});

app.put("/:id/reject", zValidator("json", rejectTagihanSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");
  const parsed = rejectTagihanSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: "Alasan harus diisi" }, 400);
  }

  const [updated] = await db
    .update(tagihan)
    .set({
      status: "ditolak",
      alasanPenolakan: parsed.data.alasan,
      buktiPembayaran: null, // Clear bukti so tenant re-uploads
    })
    .where(eq(tagihan.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Tagihan tidak ditemukan" }, 404);
  }

  // Delete rejected buktiPembayaran from R2
  if (updated.buktiPembayaran) {
    const key = extractKeyFromUrl(updated.buktiPembayaran);
    if (key) {
      console.log("[TAGIHAN] Deleting rejected bukti from R2:", key);
      await c.env.R2_BUCKET.delete(key);
    }
  }

  // Notify the tenant's DO
  await findInviteAndNotify(c.env, db, updated.noKamar);

  return c.json(updated);
});

export default app;
