import { zValidator } from "@hono/zod-validator";
import { createAuth } from "@repo/auth";
import { createDB } from "@repo/db";
import { kamar, settings, user } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../app";
import { ensureAdmin } from "../middleware/auth";
import { verifyPinValue } from "../pin";
import { removePenghuniSchema, updateKamarSchema } from "./kamar.validator";

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

app.delete(
  "/:nomor/penghuni",
  zValidator("json", removePenghuniSchema),
  async (c) => {
    const db = createDB(c.env.DATABASE_URL);
    const nomor = Number(c.req.param("nomor"));

    const parsed = z.number().int().min(1).max(12).safeParse(nomor);
    if (!parsed.success) {
      return c.json({ error: "Nomor kamar harus 1-12" }, 400);
    }

    const pinParsed = removePenghuniSchema.safeParse(c.req.valid("json"));
    if (!pinParsed.success) {
      return c.json({ error: "PIN harus 4 digit" }, 400);
    }

    const pinRow = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "security_pin"))
      .limit(1);

    const isPinValid = await verifyPinValue(
      pinRow[0]?.value,
      pinParsed.data.pin,
    );
    if (!isPinValid) {
      return c.json({ error: "PIN salah" }, 403);
    }

    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.noKamar, parsed.data))
      .limit(1);

    if (existingUser.length === 0) {
      return c.json({ error: "Tidak ada penghuni di kamar ini" }, 404);
    }

    const auth = createAuth(c.env);
    await auth.api.removeUser({
      body: { userId: existingUser[0].id },
    });

    await db
      .update(kamar)
      .set({ status: "kosong", updatedAt: new Date() })
      .where(eq(kamar.nomor, parsed.data));

    return c.json({ success: true });
  },
);

app.put("/:nomor", zValidator("json", updateKamarSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const nomor = Number(c.req.param("nomor"));

  const parsedNomor = z.number().int().min(1).max(12).safeParse(nomor);
  if (!parsedNomor.success) {
    return c.json({ error: "Nomor kamar harus 1-12" }, 400);
  }

  const parsed = updateKamarSchema.safeParse(c.req.valid("json"));
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

const resetPasswordSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
  newPassword: z.string().min(8),
});

app.put(
  "/:nomor/password",
  zValidator("json", resetPasswordSchema),
  async (c) => {
    const db = createDB(c.env.DATABASE_URL);
    const nomor = Number(c.req.param("nomor"));

    const parsedNomor = z.number().int().min(1).max(12).safeParse(nomor);
    if (!parsedNomor.success) {
      return c.json({ error: "Nomor kamar harus 1-12" }, 400);
    }

    const parsed = resetPasswordSchema.safeParse(c.req.valid("json"));
    if (!parsed.success) {
      return c.json({ error: z.prettifyError(parsed.error) }, 400);
    }

    const pinRow = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "security_pin"))
      .limit(1);

    const isPinValid = await verifyPinValue(pinRow[0]?.value, parsed.data.pin);
    if (!isPinValid) {
      return c.json({ error: "PIN salah" }, 403);
    }

    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.noKamar, parsedNomor.data))
      .limit(1);

    if (existingUser.length === 0) {
      return c.json({ error: "Tidak ada penghuni di kamar ini" }, 404);
    }

    const auth = createAuth(c.env);
    await auth.api.setUserPassword({
      body: {
        userId: existingUser[0].id,
        newPassword: parsed.data.newPassword,
      },
    });

    return c.json({ success: true });
  },
);

export default app;
