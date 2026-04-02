import type { AppType } from "@repo/api-types";
import type { Client } from "hono/client";
import { hc } from "hono/client";

const apiUrl = import.meta.env.VITE_API_URL || "/";

export const api: Client<AppType> = hc<AppType>(apiUrl, {
  fetch: (async (
    input: string | Request | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  }) as any,
}) as any;

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
