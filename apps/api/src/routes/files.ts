import { Hono } from "hono";
import type { Env } from "../app";
import { generateSignedUrlAsync } from "../lib/signing";
import { getSession } from "../middleware/auth";

const app = new Hono<{ Bindings: Env }>();

// Refresh endpoint - generates new signed URL for expired tokens
app.post("/refresh", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const { path } = await c.req.json<{ path: string }>();
  if (!path) return c.json({ error: "Path is required" }, 400);

  const [type, ...rest] = path.split("/");
  const fileName = rest.join("/");

  // Permission checks
  const canAccess = await checkAccess(
    session.user as { id: string; role?: string | null },
    type,
    fileName,
  );
  if (!canAccess) return c.json({ error: "Forbidden" }, 403);

  const url = await generateSignedUrlAsync(c.env, path);
  return c.json({ url });
});

async function checkAccess(
  currentUser: { id: string; role?: string | null },
  type: string,
  fileName: string,
): Promise<boolean> {
  // All authenticated users can access ktp, avatar, informasi
  if (["ktp", "avatar", "informasi"].includes(type)) return true;

  // For bukti - pemilik can access all, user can only access their own
  if (type === "bukti") {
    if (currentUser.role === "pemilik") return true;
    // Check if the bukti belongs to this user via filename pattern: userId-timestamp-*
    return fileName.startsWith(currentUser.id);
  }

  // For keluhan - pemilik can access all, user can only access their own
  if (type === "keluhan") {
    if (currentUser.role === "pemilik") return true;
    return fileName.startsWith(currentUser.id);
  }

  return false;
}

export default app;
