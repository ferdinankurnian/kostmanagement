import { redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  noKamar?: number | null;
  ktp?: string | null;
  ktpStatus?: "pending" | "approved" | "rejected" | null;
  ktpRejectionReason?: string | null;
  onboarding?: string | null;
};

export async function requireAuth({
  location,
}: {
  location: { href: string };
}) {
  const { data: session } = await authClient.getSession();

  if (!session) {
    const search =
      location.href !== "/" ? { redirect: location.href } : undefined;
    throw redirect({
      to: "/login",
      search,
    });
  }

  return { user: session.user as unknown as User };
}

export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async ({ context }: { context: { user: User } }) => {
    if (!roles.includes(context.user.role)) {
      throw redirect({ to: "/" });
    }
  };
}

export async function requireGuest() {
  const { data: session } = await authClient.getSession();

  if (session) {
    throw redirect({ to: "/" });
  }
}

export function getOnboardingRoute(
  step: string | null | undefined,
):
  | "/penghuni/onboarding"
  | "/penghuni"
  | "/penghuni/onboarding/bayar-tagihan"
  | "/penghuni/onboarding/rule" {
  switch (step) {
    case "tour":
      return "/penghuni";
    case "bayar_tagihan":
      return "/penghuni/onboarding/bayar-tagihan";
    case "rule":
      return "/penghuni/onboarding/rule";
    default:
      // null or "greeting" → tagihan first (step 1 of onboarding)
      return "/penghuni/onboarding/bayar-tagihan";
  }
}
