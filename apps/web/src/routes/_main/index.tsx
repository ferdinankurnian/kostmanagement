import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_main/")({
  beforeLoad: async ({ context }) => {
    const { user } = context;

    if (user.role === "admin") {
      throw redirect({ to: "/pemilik" });
    } else if (user.role === "user") {
      throw redirect({ to: "/penghuni" });
    }

    throw redirect({ to: "/login" });
  },
});
