import { createAuth } from "@repo/auth";
import type { Context, Next } from "hono";
import type { Env } from "../app";

type HonoContext = Context<{ Bindings: Env }>;

export async function ensureAdmin(c: HonoContext, next: Next) {
  const auth = createAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (session.user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
}

export async function getSession(c: HonoContext) {
  const auth = createAuth(c.env);
  return auth.api.getSession({ headers: c.req.raw.headers });
}
