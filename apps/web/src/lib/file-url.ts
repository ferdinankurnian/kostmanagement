import { API_BASE } from "@/lib/config";

function isTokenExpired(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const expires = urlObj.searchParams.get("expires");
    if (!expires) return true;

    const expiresNum = parseInt(expires, 10);
    // Token expired 5 minutes before actual expiry to give buffer
    return Date.now() > (expiresNum - 300) * 1000;
  } catch {
    return true;
  }
}

function extractPath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/files\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function getFreshUrl(originalUrl: string): Promise<string> {
  // If URL doesn't have a token, return as-is
  if (!originalUrl.includes("token=")) {
    return originalUrl;
  }

  // If token is not expired, return as-is
  if (!isTokenExpired(originalUrl)) {
    return originalUrl;
  }

  // Extract path and refresh the token
  const path = extractPath(originalUrl);
  if (!path) {
    return originalUrl;
  }

  try {
    const res = await fetch(`${API_BASE}/files/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });

    if (!res.ok) {
      console.error("[FILE-URL] Failed to refresh token:", res.status);
      return originalUrl;
    }

    const data = (await res.json()) as { url: string };
    return data.url;
  } catch (error) {
    console.error("[FILE-URL] Error refreshing token:", error);
    return originalUrl;
  }
}

export async function refreshMultipleUrls(
  urls: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  // Filter URLs that need refreshing
  const urlsToRefresh = urls.filter((url) => {
    if (!url || !url.includes("token=")) return false;
    return isTokenExpired(url);
  });

  if (urlsToRefresh.length === 0) {
    // All URLs are still valid
    for (const url of urls) {
      result.set(url, url);
    }
    return result;
  }

  // Refresh each URL (could be batched in future)
  const refreshPromises = urlsToRefresh.map(async (url) => {
    const freshUrl = await getFreshUrl(url);
    result.set(url, freshUrl);
  });

  await Promise.all(refreshPromises);

  // Add URLs that didn't need refreshing
  for (const url of urls) {
    if (!result.has(url)) {
      result.set(url, url);
    }
  }

  return result;
}
