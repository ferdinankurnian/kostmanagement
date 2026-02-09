import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/member/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/member/home"!</div>;
}
