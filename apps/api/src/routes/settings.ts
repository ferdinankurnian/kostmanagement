import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import type { Env } from "../auth-worker";
import { createDB } from "../db";
import { settings } from "../db/schema/settings";
import { getSession } from "../middleware/auth";
import {
  hashPin,
  isDefaultPinValue,
  isPinFormatValid,
  verifyPinValue,
} from "../pin";

const pinSchema = z.object({ pin: z.string().regex(/^\d{4}$/) });
const changePinSchema = z.object({
  oldPin: z.string().regex(/^\d{4}$/),
  newPin: z.string().regex(/^\d{4}$/),
});
const updateSettingSchema = z.object({ value: z.string() });

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.key === "security_pin") continue;
    map[row.key] = row.value;
  }

  if (session?.user.role === "admin") {
    const pinRow = rows.find((r) => r.key === "security_pin");
    map.is_default_pin = (await isDefaultPinValue(pinRow?.value)).toString();
  }

  return c.json(map);
});

app.post("/verify-pin", zValidator("json", pinSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const { pin } = c.req.valid("json");

  const row = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "security_pin"))
    .limit(1);

  const storedPin = row[0]?.value;
  const isValid = await verifyPinValue(storedPin, pin);
  const isDefault = await isDefaultPinValue(storedPin);

  if (isValid) {
    const hashedPin = await hashPin(pin);
    await db
      .insert(settings)
      .values({ key: "security_pin", value: hashedPin })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: hashedPin },
      });
  }

  return c.json({ valid: isValid, isDefault });
});

app.post("/change-pin", zValidator("json", changePinSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const { oldPin, newPin } = c.req.valid("json");

  const row = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "security_pin"))
    .limit(1);

  const storedPin = row[0]?.value;

  if (!(await verifyPinValue(storedPin, oldPin))) {
    return c.json({ error: "PIN lama salah" }, 403);
  }

  const newPinHash = await hashPin(newPin);
  await db
    .insert(settings)
    .values({ key: "security_pin", value: newPinHash })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: newPinHash },
    });

  return c.json({ success: true });
});

app.get("/:key", async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);
  const key = c.req.param("key");

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (key === "security_pin") {
    return c.json({ error: "Setting tidak ditemukan" }, 404);
  }

  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  if (!row[0]) {
    return c.json({ error: "Setting tidak ditemukan" }, 404);
  }
  return c.json({ key: row[0].key, value: row[0].value });
});

app.put("/:key", zValidator("json", updateSettingSchema), async (c) => {
  const db = createDB(c.env.DATABASE_URL);
  const session = await getSession(c);

  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const key = c.req.param("key");
  const parsed = updateSettingSchema.safeParse(c.req.valid("json"));

  if (!parsed.success) {
    return c.json({ error: "Value harus berupa string" }, 400);
  }

  if (key === "security_pin") {
    if (!isPinFormatValid(parsed.data.value)) {
      return c.json({ error: "PIN harus 4 digit" }, 400);
    }

    const hashedPin = await hashPin(parsed.data.value);
    await db
      .insert(settings)
      .values({ key, value: hashedPin })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: hashedPin },
      });

    return c.json({ success: true });
  }

  await db
    .insert(settings)
    .values({ key, value: parsed.data.value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: parsed.data.value },
    });

  return c.json({ success: true });
});

export default app;
