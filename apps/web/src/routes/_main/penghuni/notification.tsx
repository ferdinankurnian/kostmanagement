import { createFileRoute, useRouter } from "@tanstack/react-router";
import { NotificationPage } from "@/components/notification-page";

export const Route = createFileRoute("/_main/penghuni/notification")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  return (
    <NotificationPage
      audience="penghuni"
      onBack={() => router.history.back()}
    />
  );
}
