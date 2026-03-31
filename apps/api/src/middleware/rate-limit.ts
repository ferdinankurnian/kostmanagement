import type { Context, Next } from "hono";
import type { Env } from "../app";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimiter(opts: { limit: number; windowMs: number }) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip =
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-forwarded-for") ??
      "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      await next();
      return;
    }

    entry.count++;

    if (entry.count > opts.limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      return c.json(
        { error: "Terlalu banyak permintaan, coba lagi nanti" },
        429,
      );
    }

    await next();
  };
}
