import { neon } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

export interface Env {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGINS: string;
  R2_BUCKET: R2Bucket;
}

export function createAuth(env: Env) {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000"];

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg", // PostgreSQL
      schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: corsOrigins,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    plugins: [username(), admin()],
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
    },
    experimental: {
      joins: true,
    },
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
