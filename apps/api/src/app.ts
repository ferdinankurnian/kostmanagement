import { createAuth } from "@repo/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSession } from "./middleware/auth";
import { rateLimiter } from "./middleware/rate-limit";
import informasiRoutes from "./routes/informasi";
import inviteRoutes from "./routes/invite";
import kamarRoutes from "./routes/kamar";
import keluhanRoutes from "./routes/keluhan";
import notificationRoutes from "./routes/notification";
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
  ONBOARDING_DO: DurableObjectNamespace;
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

// Rate limit POST auth requests
app.use("/api/auth/*", async (c, next) => {
  if (c.req.method === "POST") {
    return rateLimiter({ limit: 20, windowMs: 60_000 })(c, next);
  }
  return next();
});

// Handle all auth requests
app.all("/api/auth/*", async (c) => {
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
app.route("/api/notification", notificationRoutes);

// WebSocket route for onboarding real-time status
app.get("/api/ws/invite/:id", (c) => {
  const id = c.req.param("id");
  const doId = c.env.ONBOARDING_DO.idFromName(id);
  const stub = c.env.ONBOARDING_DO.get(doId);
  const originalUrl = new URL(c.req.raw.url);
  originalUrl.pathname = "/ws";
  originalUrl.searchParams.set("code", id);
  const doRequest = new Request(originalUrl.toString(), {
    headers: c.req.raw.headers,
    method: c.req.raw.method,
  });
  return stub.fetch(doRequest);
});

export type AppType = typeof app;
