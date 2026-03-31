import { zValidator } from "@hono/zod-validator";
import { createDB } from "@repo/db";
import { informasi } from "@repo/db/schema";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../app";
import { parseFotoUrls, serializeFotoUrls } from "../lib/foto-urls";
import { getSession } from "../middleware/auth";

const app = new Hono<{ Bindings: Env }>();

const informasiSchema = z.object({
  judul: z.string().min(1).max(120),
  deskripsi: z.string().min(1).max(4000),
  fotoUrls: z.array(z.string()).max(10).optional(),
  prioritas: z.enum(["rendah", "normal", "tinggi"]),
  status: z.enum(["aktif", "nonaktif"]),
});

function sortByPriority<
  T extends { prioritas: string; createdAt: Date | null },
>(items: T[]) {
  const rank = { tinggi: 0, normal: 1, rendah: 2 };
  return items.sort((a, b) => {
    const priorityDiff =
      rank[a.prioritas as keyof typeof rank] -
      rank[b.prioritas as keyof typeof rank];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return (
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
    );
  });
}

app.get("/", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  const rows =
    session?.user.role === "admin"
      ? await db.select().from(informasi).orderBy(desc(informasi.createdAt))
      : await db
          .select()
          .from(informasi)
          .where(eq(informasi.status, "aktif"))
          .orderBy(desc(informasi.createdAt));

  return c.json(
    sortByPriority(rows).map((item) => ({
      ...item,
      fotoUrls: parseFotoUrls(item.fotoUrls),
    })),
  );
});

app.get("/:id", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);
  const id = c.req.param("id");

  const rows = await db
    .select()
    .from(informasi)
    .where(eq(informasi.id, id))
    .limit(1);
  const item = rows[0];

  if (!item) {
    return c.json({ error: "Informasi tidak ditemukan" }, 404);
  }

  if (session?.user.role !== "admin" && item.status !== "aktif") {
    return c.json({ error: "Informasi tidak ditemukan" }, 404);
  }

  return c.json({
    ...item,
    fotoUrls: parseFotoUrls(item.fotoUrls),
  });
});

app.post("/", zValidator("json", informasiSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const parsed = informasiSchema.safeParse(c.req.valid("json"));
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const [created] = await db
    .insert(informasi)
    .values({
      judul: parsed.data.judul,
      deskripsi: parsed.data.deskripsi,
      fotoUrls: serializeFotoUrls(parsed.data.fotoUrls),
      prioritas: parsed.data.prioritas,
      status: parsed.data.status,
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

app.put("/:id", zValidator("json", informasiSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const id = c.req.param("id");
  const parsed = informasiSchema.safeParse(c.req.valid("json"));
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const [updated] = await db
    .update(informasi)
    .set({
      judul: parsed.data.judul,
      deskripsi: parsed.data.deskripsi,
      fotoUrls: serializeFotoUrls(parsed.data.fotoUrls),
      prioritas: parsed.data.prioritas,
      status: parsed.data.status,
      updatedAt: new Date(),
    })
    .where(eq(informasi.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Informasi tidak ditemukan" }, 404);
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
    .delete(informasi)
    .where(eq(informasi.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Informasi tidak ditemukan" }, 404);
  }

  return c.json({ success: true });
});

export default app;
