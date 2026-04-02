const LEGACY_SHA256_PATTERN = /^[0-9a-f]{64}$/;
const PBKDF2_PREFIX = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 100_000;
const DEFAULT_PIN = "1234";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hash));
}

async function pbkdf2(pin: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

function randomSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function isPinFormatValid(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  const salt = randomSalt();
  const digest = await pbkdf2(pin, salt);
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${digest}`;
}

export async function verifyPinValue(
  storedPin: string | undefined,
  inputPin: string,
): Promise<boolean> {
  const value = storedPin ?? DEFAULT_PIN;

  if (value.startsWith(`${PBKDF2_PREFIX}$`)) {
    const [, iterations, saltHex, digest] = value.split("$");
    const salt = hexToBytes(saltHex ?? "");
    const expectedIterations = Number(iterations);

    if (
      expectedIterations !== PBKDF2_ITERATIONS ||
      salt.length === 0 ||
      !digest
    ) {
      return false;
    }

    const inputDigest = await pbkdf2(inputPin, salt);
    return inputDigest === digest;
  }

  if (LEGACY_SHA256_PATTERN.test(value)) {
    return (await sha256(inputPin)) === value;
  }

  return value === inputPin;
}

export async function isDefaultPinValue(
  storedPin: string | undefined,
): Promise<boolean> {
  return verifyPinValue(storedPin, DEFAULT_PIN);
}

export { DEFAULT_PIN };
