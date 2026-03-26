import { neon } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

// Khusus buat CLI & local dev - pake process.env
const connectionString = process.env.DATABASE_URL || "";
const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || "",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  plugins: [username(), admin()],
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
    },
  },
});

export type Auth = typeof auth;
