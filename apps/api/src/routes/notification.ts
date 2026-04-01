import { createDB } from "@repo/db";
import { notificationRead } from "@repo/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../app";
import { getSession } from "../middleware/auth";

const app = new Hono<{ Bindings: Env }>();

app.get("/read-status", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const rows = await db
    .select({
      notificationKey: notificationRead.notificationKey,
      readAt: notificationRead.readAt,
    })
    .from(notificationRead)
    .where(eq(notificationRead.userId, session.user.id));

  const readMap: Record<string, string> = {};
  for (const row of rows) {
    readMap[row.notificationKey] = row.readAt.toISOString();
  }

  return c.json(readMap);
});

const markReadSchema = z.object({
  notificationKeys: z.array(z.string()).min(1),
});

app.post("/mark-read", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const parsed = markReadSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  const { notificationKeys } = parsed.data;
  const now = new Date();

  for (const key of notificationKeys) {
    const existing = await db
      .select()
      .from(notificationRead)
      .where(
        and(
          eq(notificationRead.userId, session.user.id),
          eq(notificationRead.notificationKey, key),
        ),
      )
      .limit(1);

    if (!existing[0]) {
      await db.insert(notificationRead).values({
        userId: session.user.id,
        notificationKey: key,
        readAt: now,
      });
    }
  }

  return c.json({ success: true });
});

app.delete("/cleanup", async (c) => {
  const db = createDB(c.env.DATABASE_URL);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .delete(notificationRead)
    .where(
      and(
        eq(notificationRead.userId, c.req.query("userId") || ""),
        lt(notificationRead.readAt, sevenDaysAgo),
      ),
    )
    .returning();

  return c.json({
    deleted: result.length,
    message: `Cleaned up ${result.length} old notification read records`,
  });
});

export default app;
