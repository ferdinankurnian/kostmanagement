import { API_BASE } from "@/lib/config";

type Invitation = {
  id: string;
  code: string;
  name: string;
  noKamar: number;
  isUsed: boolean;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
};

export async function createInvite(data: {
  name: string;
  noKamar: number;
}): Promise<Invitation> {
  const res = await fetch(`${API_BASE}/invite`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal membuat undangan");
  }
  return res.json();
}

export async function validateInvite(data: {
  code: string;
}): Promise<Invitation> {
  const res = await fetch(`${API_BASE}/invite/validate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Kode tidak valid");
  }
  return res.json();
}

export async function useInvite(data: {
  code: string;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/invite/use`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal menggunakan undangan");
  }
  return res.json();
}

export async function getInvite(id: string): Promise<Invitation | null> {
  const res = await fetch(`${API_BASE}/invite/${id}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengambil data undangan");
  }
  return res.json();
}
