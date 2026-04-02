import type { Env } from "../app";

const BASE_URL = "https://api.kost.iydheko.site/files/";

const EXPIRY_SECONDS: Record<string, number> = {
  ktp: 24 * 60 * 60, // 24 hours
  avatar: 7 * 24 * 60 * 60, // 7 days
  bukti: 14 * 24 * 60 * 60, // 14 days
  informasi: 30 * 24 * 60 * 60, // 30 days
  keluhan: 14 * 24 * 60 * 60, // 14 days
};

function getFileType(path: string): string {
  const prefix = path.split("/")[0];
  return prefix ?? "other";
}

function getExpiryForType(path: string): number {
  const type = getFileType(path);
  return EXPIRY_SECONDS[type] ?? EXPIRY_SECONDS.bukti;
}

async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function generateHmac(secret: string, data: string): Promise<string> {
  const key = await importKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateSignedUrlAsync(
  env: Env,
  path: string,
  customExpiry?: number,
): Promise<string> {
  const expires =
    Math.floor(Date.now() / 1000) + (customExpiry ?? getExpiryForType(path));
  const data = `${path}:${expires}`;
  const token = await generateHmac(env.BETTER_AUTH_SECRET, data);
  return `${BASE_URL}${path}?token=${token}&expires=${expires}`;
}

export async function verifySignedToken(
  env: Env,
  path: string,
  token: string,
  expires: number,
): Promise<boolean> {
  // Check expiry
  if (Date.now() > expires * 1000) {
    return false;
  }

  const data = `${path}:${expires}`;
  const expectedToken = await generateHmac(env.BETTER_AUTH_SECRET, data);
  return token === expectedToken;
}

export async function refreshSignedUrl(
  env: Env,
  path: string,
): Promise<string> {
  return generateSignedUrlAsync(env, path);
}
