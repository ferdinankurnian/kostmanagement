import { createRootRoute, Outlet } from "@tanstack/react-router";
import { EphemeralSessionValidator } from "@/components/ephemeral-session-validator";
import { NotificationSync } from "@/components/notification-sync";
import { TanStackQueryProvider } from "@/components/tanstack-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TanStackQueryProvider>
        <div className="max-w-lg mx-auto">
          <EphemeralSessionValidator />
          <NotificationSync />
          <Outlet />
        </div>
        <Toaster position="top-center" />
      </TanStackQueryProvider>
    </ThemeProvider>
  );
}
