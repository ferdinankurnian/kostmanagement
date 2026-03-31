import { neon } from "@neondatabase/serverless";
import { schema } from "@repo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";

export function createAuth(env: {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGINS?: string;
}) {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const trustedOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

  const isProduction = env.BETTER_AUTH_URL.startsWith("https://");

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    plugins: [username(), admin()],
    experimental: {
      joins: true,
    },
    ...(isProduction && {
      advanced: {
        crossSubDomainCookies: {
          enabled: true,
          domain: new URL(env.BETTER_AUTH_URL).hostname
            .split(".")
            .slice(-2)
            .join("."),
        },
      },
    }),
    user: {
      additionalFields: {
        noTelepon: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        noTeleponDarurat: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        ktp: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        noKamar: {
          type: "number",
          required: false,
          input: true,
          returned: true,
        },
        onboarding: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        bayarSampai: {
          type: "date",
          required: false,
          input: true,
          returned: true,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
