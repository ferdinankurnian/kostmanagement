import { createAuth } from "@repo/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSession } from "./middleware/auth";
import { rateLimiter } from "./middleware/rate-limit";
import informasiRoutes from "./routes/informasi";
import inviteRoutes from "./routes/invite";
import kamarRoutes from "./routes/kamar";
import keluhanRoutes from "./routes/keluhan";
import onboardingRoutes from "./routes/onboarding";
import settingsRoutes from "./routes/settings";
import tagihanRoutes from "./routes/tagihan";
import uploadRoutes from "./routes/upload";

export interface Env {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGINS: string;
  R2_BUCKET: R2Bucket;
}

export const app = new Hono<{ Bindings: Env }>();

const defaultOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use("*", (c, next) => {
  const origins = c.env.CORS_ORIGINS
    ? c.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : defaultOrigins;

  return cors({
    origin: (origin) => {
      if (!origin) return null;
      return origins.includes(origin) ? origin : null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })(c, next);
});

app.on(
  ["POST"],
  "/api/auth/**",
  rateLimiter({ limit: 20, windowMs: 60_000 }),
  (c) => {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
  },
);

app.on(["GET"], "/api/auth/**", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

app.get("/api/files/*", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const path = c.req.path.replace("/api/files/", "");
  const object = await c.env.R2_BUCKET.get(path);

  if (!object) {
    return c.json({ error: "File tidak ditemukan" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=3600");

  return new Response(object.body, { headers });
});

app.route("/api/informasi", informasiRoutes);
app.route("/api/kamar", kamarRoutes);
app.route("/api/keluhan", keluhanRoutes);
app.route("/api/invite", inviteRoutes);
app.route("/api/onboarding", onboardingRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/tagihan", tagihanRoutes);
app.route("/api/upload", uploadRoutes);

export type AppType = typeof app;
