import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/penghuni/onboarding")({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== "user") {
      throw redirect({ to: "/" });
    }

    // If already completed or on tour, go to main dashboard
    if (
      context.user.onboarding === "completed" ||
      context.user.onboarding === "tour"
    ) {
      throw redirect({ to: "/penghuni" });
    }

    // KTP must be approved before proceeding with onboarding
    // If not approved (pending/rejected/null), shouldn't be here
    if (!context.user.ktpStatus || context.user.ktpStatus !== "approved") {
      throw redirect({ to: "/" });
    }
  },
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return <Outlet />;
}
