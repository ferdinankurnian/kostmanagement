import { zValidator } from "@hono/zod-validator";
import { createDB } from "@repo/db";
import { keluhan, user } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../app";
import { parseFotoUrls, serializeFotoUrls } from "../lib/foto-urls";
import { getSession } from "../middleware/auth";

const app = new Hono<{ Bindings: Env }>();

const createKeluhanSchema = z.object({
  judul: z.string().min(1).max(120),
  deskripsi: z.string().min(1).max(2000),
  fotoUrls: z.array(z.string()).max(10).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["dibuka", "diproses", "selesai"]),
  catatanPemilik: z.string().nullable().optional(),
});

app.get("/", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const baseQuery = db
    .select({
      id: keluhan.id,
      userId: keluhan.userId,
      noKamar: keluhan.noKamar,
      judul: keluhan.judul,
      deskripsi: keluhan.deskripsi,
      fotoUrls: keluhan.fotoUrls,
      status: keluhan.status,
      catatanPemilik: keluhan.catatanPemilik,
      selesaiAt: keluhan.selesaiAt,
      createdAt: keluhan.createdAt,
      updatedAt: keluhan.updatedAt,
      namaPenghuni: user.name,
    })
    .from(keluhan)
    .innerJoin(user, eq(user.id, keluhan.userId));

  const rows =
    session.user.role === "admin"
      ? await baseQuery.orderBy(desc(keluhan.createdAt))
      : await baseQuery
          .where(eq(keluhan.userId, session.user.id))
          .orderBy(desc(keluhan.createdAt));

  return c.json(
    rows.map((item) => ({
      ...item,
      fotoUrls: parseFotoUrls(item.fotoUrls),
    })),
  );
});

app.get("/:id", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const row = await db
    .select({
      id: keluhan.id,
      userId: keluhan.userId,
      noKamar: keluhan.noKamar,
      judul: keluhan.judul,
      deskripsi: keluhan.deskripsi,
      fotoUrls: keluhan.fotoUrls,
      status: keluhan.status,
      catatanPemilik: keluhan.catatanPemilik,
      selesaiAt: keluhan.selesaiAt,
      createdAt: keluhan.createdAt,
      updatedAt: keluhan.updatedAt,
      namaPenghuni: user.name,
    })
    .from(keluhan)
    .innerJoin(user, eq(user.id, keluhan.userId))
    .where(
      session.user.role === "admin"
        ? eq(keluhan.id, id)
        : and(eq(keluhan.id, id), eq(keluhan.userId, session.user.id)),
    )
    .limit(1);

  if (!row[0]) {
    return c.json({ error: "Keluhan tidak ditemukan" }, 404);
  }

  return c.json({
    ...row[0],
    fotoUrls: parseFotoUrls(row[0].fotoUrls),
  });
});

app.post("/", zValidator("json", createKeluhanSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "user") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const noKamar = (session.user as { noKamar?: number | null }).noKamar;
  if (!noKamar) {
    return c.json({ error: "Penghuni belum terhubung ke kamar" }, 400);
  }

  const parsed = createKeluhanSchema.safeParse(c.req.valid("json"));
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const [created] = await db
    .insert(keluhan)
    .values({
      userId: session.user.id,
      noKamar,
      judul: parsed.data.judul,
      deskripsi: parsed.data.deskripsi,
      fotoUrls: serializeFotoUrls(parsed.data.fotoUrls),
    })
    .returning();

  return c.json(
    {
      ...created,
      fotoUrls: parseFotoUrls(created.fotoUrls),
    },
    201,
  );
});

app.put("/:id/status", zValidator("json", updateStatusSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");
  const parsed = updateStatusSchema.safeParse(c.req.valid("json"));
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const [updated] = await db
    .update(keluhan)
    .set({
      status: parsed.data.status,
      catatanPemilik: parsed.data.catatanPemilik ?? null,
      selesaiAt: parsed.data.status === "selesai" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(keluhan.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Keluhan tidak ditemukan" }, 404);
  }

  return c.json({
    ...updated,
    fotoUrls: parseFotoUrls(updated.fotoUrls),
  });
});

app.delete("/:id", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");

  const [deleted] = await db
    .delete(keluhan)
    .where(eq(keluhan.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Keluhan tidak ditemukan" }, 404);
  }

  return c.json({ success: true });
});

export default app;
