import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PemilikTabBar } from "@/components/tab-bar";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_main/pemilik/_main")({
  beforeLoad: requireRole("admin"),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pb-24">
      <Outlet />
      <PemilikTabBar />
    </div>
  );
}
