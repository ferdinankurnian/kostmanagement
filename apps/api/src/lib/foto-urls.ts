export function serializeFotoUrls(fotoUrls: string[] | undefined): string {
  return JSON.stringify(fotoUrls ?? []);
}

export function parseFotoUrls(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed;
    }
  } catch {
    // Fallback for legacy comma-separated values.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
