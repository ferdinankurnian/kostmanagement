import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/_main")({
  beforeLoad: requireAuth,
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
