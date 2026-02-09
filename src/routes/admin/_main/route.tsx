import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNavbar } from "@/components/admin-navbar";

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
