import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/penghuni/onboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_main/penghuni/onboarding/"!</div>;
}
