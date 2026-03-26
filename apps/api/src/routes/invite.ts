import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { customAlphabet } from "nanoid";
import { z } from "zod/v4";
import type { Env } from "../auth-worker";
import { createDB } from "../db";
import { invitation, user } from "../db/schema/auth";
import { kamar } from "../db/schema/kamar";
import { ensureAdmin, getSession } from "../middleware/auth";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const app = new Hono<{ Bindings: Env }>();

// admin buat invitation
app.post("/", ensureAdmin, async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const body = await c.req.json();

  const parsed = z
    .object({ name: z.string().min(1), noKamar: z.number().min(1).max(12) })
    .safeParse(body);
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
});

// penghuni validasi code sebelum signup
app.post("/validate", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const body = await c.req.json();

  const parsed = z.object({ code: z.string() }).safeParse(body);
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
app.post("/use", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const body = await c.req.json();

  const parsed = z.object({ code: z.string() }).safeParse(body);
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

  // 3. Link user ke kamar dan set role
  await db
    .update(user)
    .set({ noKamar: inv.noKamar, role: "user" })
    .where(eq(user.id, session.user.id));

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
