import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth-worker";
import informasiRoutes from "./routes/informasi";
import inviteRoutes from "./routes/invite";
import kamarRoutes from "./routes/kamar";
import keluhanRoutes from "./routes/keluhan";
import onboardingRoutes from "./routes/onboarding";
import settingsRoutes from "./routes/settings";
import tagihanRoutes from "./routes/tagihan";
import uploadRoutes from "./routes/upload";

export const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => {
      const allowed = (c.env as Env).CORS_ORIGINS || "http://localhost:3000";
      const origins = allowed.split(",").map((o) => o.trim());
      return origins.includes(origin) ? origin : origins[0];
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

app.get("/api/files/*", async (c) => {
  const path = c.req.path.replace("/api/files/", "");
  const object = await c.env.R2_BUCKET.get(path);

  if (!object) {
    return c.json({ error: "File tidak ditemukan" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

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
