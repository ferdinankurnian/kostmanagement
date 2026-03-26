import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth-worker";
import inviteRoutes from "./routes/invite";
import kamarRoutes from "./routes/kamar";
import uploadRoutes from "./routes/upload";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

app.route("/api/kamar", kamarRoutes);
app.route("/api/invite", inviteRoutes);
app.route("/api/upload", uploadRoutes);

export default app;
