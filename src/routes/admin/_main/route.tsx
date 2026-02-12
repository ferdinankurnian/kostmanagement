import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNavbar } from "@/components/tabbar";

export const Route = createFileRoute("/admin/_main")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
      <AdminNavbar />
    </>
  );
}
