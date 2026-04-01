import { API_BASE } from "@/lib/config";

export type ReadStatusMap = Record<string, string>;

export async function getNotificationReadStatus(): Promise<ReadStatusMap> {
  const res = await fetch(`${API_BASE}/notification/read-status`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      (err as { error?: string } | null)?.error ||
        "Failed to fetch read status",
    );
  }
  return res.json();
}

export async function markNotificationAsRead(
  notificationKeys: string[],
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/notification/mark-read`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      (err as { error?: string } | null)?.error ||
        "Failed to mark notification as read",
    );
  }
  return res.json();
}

export function extractNotificationKey(notificationId: string): string | null {
  const parts = notificationId.split(":");
  if (parts.length < 2) return null;
  return `${parts[0]}:${parts[1]}`;
}
