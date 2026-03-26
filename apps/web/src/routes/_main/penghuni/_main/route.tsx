import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PenghuniTabBar } from "@/components/tab-bar";

export const Route = createFileRoute("/_main/penghuni/_main")({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== "user") {
      throw redirect({ to: "/" });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pb-24">
      <Outlet />
      <PenghuniTabBar />
    </div>
  );
}
