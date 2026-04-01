const BOOT_MARKER_KEY = "better-auth-boot-marker";
const PERSISTENT_SESSION_KEY = "better-auth-persistent-session";

function generateBootMarker(): string {
  return `boot-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function setEphemeralSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BOOT_MARKER_KEY, generateBootMarker());
  localStorage.removeItem(PERSISTENT_SESSION_KEY);
}

export function setPersistentSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERSISTENT_SESSION_KEY, "true");
  sessionStorage.removeItem(BOOT_MARKER_KEY);
}

function hasPersistentSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PERSISTENT_SESSION_KEY) === "true";
}

function isEphemeralSessionValid(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(BOOT_MARKER_KEY) !== null;
}

export function clearSessionMarkers(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BOOT_MARKER_KEY);
  localStorage.removeItem(PERSISTENT_SESSION_KEY);
}

export async function shouldForceSignOut(
  getSession: () => Promise<{ data: unknown }>,
): Promise<boolean> {
  if (hasPersistentSession()) return false;
  if (isEphemeralSessionValid()) return false;

  const { data } = await getSession();
  return !!data;
}
