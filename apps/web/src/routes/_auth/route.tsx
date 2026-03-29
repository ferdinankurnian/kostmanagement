import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { getOnboardingRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session) {
      const user = session.user as {
        role?: string | null;
        onboarding?: string | null;
      };

      if (user.role === "user" && user.onboarding !== "completed") {
        throw redirect({ to: getOnboardingRoute(user.onboarding) });
      }

      if (user.role === "user" && user.onboarding === "completed") {
        throw redirect({ to: "/penghuni" });
      }

      if (user.role === "admin") {
        throw redirect({ to: "/pemilik" });
      }

      throw redirect({ to: "/" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
