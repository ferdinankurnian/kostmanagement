import { API_BASE } from "@/lib/config";

export type TagihanStatus =
  | "belum_dibayar"
  | "menunggu_verifikasi"
  | "lunas"
  | "ditolak";

export type MetodePembayaran = "cash" | "transfer";

export interface Tagihan {
  id: string;
  noKamar: number;
  userId: string;
  namaPenghuni: string | null;
  jumlah: number;
  periode: string;
  status: TagihanStatus;
  metodePembayaran: MetodePembayaran | null;
  buktiPembayaran: string | null;
  alasanPenolakan: string | null;
  tanggalJatuhTempo: string;
  tanggalBayar: string | null;
  monthsPaid: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export async function getTagihan(): Promise<Tagihan[]> {
  const res = await fetch(`${API_BASE}/tagihan`, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengambil tagihan");
  }
  return res.json();
}

export async function getTagihanById(id: string): Promise<Tagihan> {
  const res = await fetch(`${API_BASE}/tagihan/${id}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengambil tagihan");
  }
  return res.json();
}

export async function submitTagihan(
  id: string,
  data: {
    metodePembayaran: MetodePembayaran;
    buktiPembayaran: string;
    monthsPaid?: number;
  },
): Promise<Tagihan> {
  const res = await fetch(`${API_BASE}/tagihan/${id}/submit`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal submit pembayaran");
  }
  return res.json();
}

export async function acceptTagihan(id: string): Promise<Tagihan> {
  const res = await fetch(`${API_BASE}/tagihan/${id}/accept`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal menerima pembayaran");
  }
  return res.json();
}

export async function rejectTagihan(
  id: string,
  alasan: string,
): Promise<Tagihan> {
  const res = await fetch(`${API_BASE}/tagihan/${id}/reject`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alasan }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal menolak pembayaran");
  }
  return res.json();
}
