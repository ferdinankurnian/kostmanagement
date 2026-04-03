import { createAuth } from "@repo/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { verifySignedToken } from "./lib/signing";
import { rateLimiter } from "./middleware/rate-limit";
import fileRoutes from "./routes/files";
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
  ALWAYS_PERSISTENCE_KOST_DATA: string;
}

export const app = new Hono<{ Bindings: Env }>();

// Cache auth instances per env to avoid recreating on every request
const authCache = new Map<string, any>();

function getAuth(env: Env) {
  const key = `${env.DATABASE_URL}:${env.BETTER_AUTH_SECRET}`;
  if (!authCache.has(key)) {
    authCache.set(key, createAuth(env));
  }
  return authCache.get(key);
}

// Global error handler
app.onError((error, c) => {
  console.error("API Error:", error);
  return c.json({ error: "Internal server error" }, { status: 500 });
});

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
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
});

app.get("/files/*", async (c) => {
  const path = c.req.path.replace("/files/", "");
  const token = c.req.query("token");
  const expires = c.req.query("expires");

  console.log("[FILES] Request:", {
    path,
    hasToken: !!token,
    hasExpires: !!expires,
  });

  // Validate token and expiry
  if (!token || !expires) {
    console.log("[FILES] Missing token or expires");
    return c.json({ error: "Missing token" }, 403);
  }

  const expiresNum = parseInt(expires, 10);
  if (Number.isNaN(expiresNum)) {
    console.log("[FILES] Invalid expires value:", expires);
    return c.json({ error: "Invalid expires" }, 403);
  }

  // Check if token expired
  if (Date.now() > expiresNum * 1000) {
    console.log("[FILES] Token expired");
    return c.json({ error: "Token expired" }, 403);
  }

  // Verify token
  const isValid = await verifySignedToken(c.env, path, token, expiresNum);
  if (!isValid) {
    console.log("[FILES] Invalid token");
    return c.json({ error: "Invalid token" }, 403);
  }

  // Fetch from R2
  const object = await c.env.R2_BUCKET.get(path);

  if (!object) {
    console.log("[FILES] File not found in R2:", path);
    return c.json({ error: "File tidak ditemukan" }, 404);
  }

  console.log("[FILES] Serving file:", path);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=3600");

  return new Response(object.body, { headers });
});

app.route("/api/files", fileRoutes);
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
