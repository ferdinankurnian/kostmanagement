import { API_BASE } from "@/lib/config";

export interface InformasiKostCard {
  id: string;
  title: string;
  description: string;
}

export function createInformasiKostCard(
  overrides: Partial<InformasiKostCard> = {},
): InformasiKostCard {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    ...overrides,
  };
}

export function parseInformasiKostCards(
  cardsString: string | undefined | null,
): InformasiKostCard[] {
  if (!cardsString) {
    return [];
  }

  try {
    const parsed = JSON.parse(cardsString);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isInformasiKostCard)
      .map((card) => ({ ...createInformasiKostCard(), ...card }));
  } catch {
    return [];
  }
}

export function serializeInformasiKostCards(
  cards: InformasiKostCard[],
): string {
  return JSON.stringify(cards);
}

export interface Settings {
  nama_kost?: string;
  harga_sewa?: string;
  alamat?: string;
  nama_bank?: string;
  no_rekening?: string;
  nama_pemilik_rekening?: string;
  peraturan_kost?: string;
  peraturan_kost_cards?: string;
  is_default_pin?: string;
  [key: string]: string | undefined;
}

function isInformasiKostCard(
  value: unknown,
): value is Omit<InformasiKostCard, "id"> &
  Partial<Pick<InformasiKostCard, "id">> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const card = value as Record<string, unknown>;

  return typeof card.title === "string" && typeof card.description === "string";
}

export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/settings`, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengambil pengaturan");
  }
  return res.json();
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const res = await fetch(`${API_BASE}/settings/${key}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal update pengaturan");
  }
}

export async function verifyPin(
  pin: string,
): Promise<{ valid: boolean; isDefault: boolean }> {
  const res = await fetch(`${API_BASE}/settings/verify-pin`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal verifikasi PIN");
  }
  return res.json();
}

export async function changePin(
  oldPin: string,
  newPin: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/settings/change-pin`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPin, newPin }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengubah PIN");
  }
  return res.json();
}
