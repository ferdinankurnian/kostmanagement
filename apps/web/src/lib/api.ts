import type { AppType } from "@repo/api-types";
import { hc } from "hono/client";

export const api = hc<AppType>("/", {
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  },
});

export async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(error?.error || fallbackMessage);
  }

  return (await response.json()) as T;
}
