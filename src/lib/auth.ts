import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // disable forgot password flow karena ga pake email
    sendResetPassword: undefined,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
    }),
    tanstackStartCookies(),
  ],
  // disable semua email-related features
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
});
