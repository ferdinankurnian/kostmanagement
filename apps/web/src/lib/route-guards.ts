import { redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
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

  return { user: session.user as User };
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

export function combineGuards(...guards: Function[]) {
  return async (ctx: any) => {
    let result = {};
    for (const guard of guards) {
      const res = await guard(ctx);
      result = { ...result, ...res };
    }
    return result;
  };
}
