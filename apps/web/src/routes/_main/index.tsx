import { createFileRoute, redirect } from "@tanstack/react-router";
import { getOnboardingRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/_main/")({
  beforeLoad: async ({ context }) => {
    const { user } = context;

    if (user.role === "admin") {
      throw redirect({ to: "/pemilik" });
    }

    if (user.role === "user") {
      // If KTP is not approved, show a status page
      if (
        !user.ktpStatus ||
        user.ktpStatus === "pending" ||
        user.ktpStatus === "rejected"
      ) {
        throw redirect({ to: "/penghuni/status" });
      }

      // If KTP approved but onboarding incomplete, go to onboarding
      // null/greeting → bayar_tagihan, tour → /penghuni, rule → rule
      if (
        !user.onboarding ||
        user.onboarding === "greeting" ||
        (user.onboarding !== "completed" && user.onboarding !== "tour")
      ) {
        throw redirect({ to: getOnboardingRoute(user.onboarding) });
      }

      // Otherwise go to penghuni dashboard
      throw redirect({ to: "/penghuni" });
    }

    throw redirect({ to: "/login" });
  },
});
