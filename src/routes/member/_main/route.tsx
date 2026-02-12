import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberNavbar } from "@/components/tabbar";

export const Route = createFileRoute("/member/_main")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
      <MemberNavbar />
    </>
  );
}
