import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../auth-worker";
import { createDB } from "../db";
import { user } from "../db/schema/auth";
import { getSession } from "../middleware/auth";
import { updateOnboardingSchema } from "./onboarding.validator";

const app = new Hono<{ Bindings: Env }>();

app.put("/", zValidator("json", updateOnboardingSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const parsed = updateOnboardingSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400);
  }

  await db
    .update(user)
    .set({ onboarding: parsed.data.step })
    .where(eq(user.id, session.user.id));

  return c.json({ success: true });
});

export default app;
