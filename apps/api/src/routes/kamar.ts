import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../auth-worker";
import { createDB } from "../db";
import { kamar, user } from "../db/schema";
import { ensureAdmin } from "../middleware/auth";
import { updateKamarSchema } from "./kamar.validator";

const app = new Hono<{ Bindings: Env }>();

app.use("*", ensureAdmin);

app.get("/", async (c) => {
  const db = createDB(c.env.DATABASE_URL);

  const result = await db
    .select({
      nomor: kamar.nomor,
      status: kamar.status,
      catatan: kamar.catatan,
      penghuni: {
        nama: user.name,
        noTelepon: user.noTelepon,
        tanggalMasuk: user.createdAt,
      },
    })
    .from(kamar)
    .leftJoin(user, eq(user.noKamar, kamar.nomor))
    .orderBy(kamar.nomor);

  return c.json(result);
});

app.get("/:nomor", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const nomor = Number(c.req.param("nomor"));

  const parsed = z.number().int().min(1).max(12).safeParse(nomor);
  if (!parsed.success) {
    return c.json({ error: "Nomor kamar harus 1-12" }, 400);
  }

  const result = await db
    .select()
    .from(kamar)
    .where(eq(kamar.nomor, parsed.data));
  return c.json(result[0] ?? null);
});

app.put("/:nomor", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const nomor = Number(c.req.param("nomor"));

  const parsedNomor = z.number().int().min(1).max(12).safeParse(nomor);
  if (!parsedNomor.success) {
    return c.json({ error: "Nomor kamar harus 1-12" }, 400);
  }

  const body = await c.req.json();
  const parsed = updateKamarSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const result = await db
    .update(kamar)
    .set({
      status: parsed.data.status,
      catatan: parsed.data.catatan,
      updatedAt: new Date(),
    })
    .where(eq(kamar.nomor, parsedNomor.data))
    .returning();

  return c.json(result[0]);
});

export default app;
