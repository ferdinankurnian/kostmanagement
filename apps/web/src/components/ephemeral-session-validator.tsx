import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  clearSessionMarkers,
  shouldForceSignOut,
} from "@/lib/ephemeral-session";

export function EphemeralSessionValidator() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = async () => {
      try {
        const forceSignOut = await shouldForceSignOut(
          authClient.getSession as () => Promise<{ data: unknown }>,
        );
        if (forceSignOut) {
          clearSessionMarkers();
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                const isAuthPage = [
                  "/login",
                  "/sign-up",
                  "/forgot-password",
                ].some((p) => window.location.pathname.startsWith(p));
                if (!isAuthPage) {
                  window.location.replace("/login");
                }
              },
            },
          });
        }
      } catch {
        // ignore
      }
    };

    check();
  }, []);

  return null;
}
