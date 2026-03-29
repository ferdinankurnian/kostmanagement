import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  getNotificationPermission,
  isNotificationEnabled,
  readStoredNotificationIds,
  registerNotificationServiceWorker,
  showDeviceNotification,
  writeStoredNotificationIds,
} from "@/lib/pwa-notifications";
import { useNotificationFeed } from "@/lib/use-notification-feed";

function getRoleFromSession(role: string | null | undefined) {
  if (role === "admin") {
    return "pemilik" as const;
  }

  if (role === "user") {
    return "penghuni" as const;
  }

  return null;
}

export function NotificationSync() {
  const { data: session } = useSession();
  const role = getRoleFromSession(session?.user.role);
  const { notifications } = useNotificationFeed(role, {
    enabled: Boolean(role),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    void registerNotificationServiceWorker();
  }, []);

  useEffect(() => {
    if (!role || !isNotificationEnabled()) {
      return;
    }

    if (getNotificationPermission() !== "granted") {
      return;
    }

    const storedIds = readStoredNotificationIds(role);
    const currentIds = notifications.map((item) => item.id);

    if (storedIds.length === 0) {
      writeStoredNotificationIds(role, currentIds);
      return;
    }

    const knownIds = new Set(storedIds);
    const unseenNotifications = notifications.filter(
      (item) => !knownIds.has(item.id),
    );

    if (unseenNotifications.length === 0) {
      writeStoredNotificationIds(role, [...currentIds, ...storedIds]);
      return;
    }

    void (async () => {
      for (const item of unseenNotifications.slice(0, 3)) {
        await showDeviceNotification({
          body: item.description,
          tag: item.id,
          title: item.title,
          url: item.href,
        });
      }

      writeStoredNotificationIds(role, [...currentIds, ...storedIds]);
    })();
  }, [notifications, role]);

  return null;
}
