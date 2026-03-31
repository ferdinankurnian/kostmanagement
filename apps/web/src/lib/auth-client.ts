import { adminClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/lib/config";

export const authClient = createAuthClient({
  ...(API_URL ? { baseURL: API_URL } : {}),
  plugins: [usernameClient(), adminClient()],
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
