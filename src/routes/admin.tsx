import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pb-20">
      <Outlet />
    </div>
  );
}
