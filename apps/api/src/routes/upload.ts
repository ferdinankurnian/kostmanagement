import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../auth-worker";
import { createDB } from "../db";
import { user } from "../db/schema/auth";
import { getSession } from "../middleware/auth";

const app = new Hono<{ Bindings: Env }>();
const uploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  base64: z.string(),
});

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

  // Save the key as URL path
  const url = `/api/files/${key}`;

  // Update user profile
  const db = createDB(c.env.DATABASE_URL);
  await db.update(user).set({ ktp: url }).where(eq(user.id, session.user.id));

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

  const url = `/api/files/${key}`;

  return c.json({ url });
});

export default app;
