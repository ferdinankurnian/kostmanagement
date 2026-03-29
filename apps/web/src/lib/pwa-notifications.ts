export type NotificationRole = "pemilik" | "penghuni";

export interface DeviceNotificationPayload {
  body: string;
  tag: string;
  title: string;
  url: string;
}

const ENABLED_KEY = "kost-management:notifications:enabled";
const NOTIFIED_KEY_PREFIX = "kost-management:notifications:notified";

function canUseBrowserApis() {
  return typeof window !== "undefined";
}

export function isNotificationSupported() {
  return (
    canUseBrowserApis() &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (!canUseBrowserApis() || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function isNotificationEnabled() {
  if (!canUseBrowserApis()) {
    return false;
  }

  return window.localStorage.getItem(ENABLED_KEY) === "true";
}

export function setNotificationEnabled(enabled: boolean) {
  if (!canUseBrowserApis()) {
    return;
  }

  window.localStorage.setItem(ENABLED_KEY, String(enabled));
}

export function getNotifiedStorageKey(role: NotificationRole) {
  return `${NOTIFIED_KEY_PREFIX}:${role}`;
}

export function readStoredNotificationIds(role: NotificationRole) {
  if (!canUseBrowserApis()) {
    return [];
  }

  const raw = window.localStorage.getItem(getNotifiedStorageKey(role));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeStoredNotificationIds(
  role: NotificationRole,
  notificationIds: string[],
) {
  if (!canUseBrowserApis()) {
    return;
  }

  const uniqueIds = [...new Set(notificationIds)].slice(0, 100);
  window.localStorage.setItem(
    getNotifiedStorageKey(role),
    JSON.stringify(uniqueIds),
  );
}

export async function registerNotificationServiceWorker() {
  if (!isNotificationSupported()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function requestNotificationAccess() {
  if (!isNotificationSupported()) {
    return "unsupported" as const;
  }

  await registerNotificationServiceWorker();

  const permission = await Notification.requestPermission();
  setNotificationEnabled(permission === "granted");

  return permission;
}

export async function showDeviceNotification(
  payload: DeviceNotificationPayload,
) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const registration =
    (await navigator.serviceWorker.ready.catch(() => null)) ??
    (await registerNotificationServiceWorker());

  if (!registration) {
    return false;
  }

  await registration.showNotification(payload.title, {
    badge: "/logo192.png",
    body: payload.body,
    data: {
      url: payload.url,
    },
    icon: "/logo192.png",
    tag: payload.tag,
  });

  return true;
}
