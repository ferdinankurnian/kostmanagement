import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/penghuni/onboarding")({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== "user") {
      throw redirect({ to: "/" });
    }

    if (
      context.user.onboarding === "completed" ||
      context.user.onboarding === "tour"
    ) {
      throw redirect({ to: "/penghuni" });
    }
  },
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return <Outlet />;
}
