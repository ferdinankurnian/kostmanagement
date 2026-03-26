const API_BASE = "http://localhost:8787/api";

type KamarResponse = {
  nomor: number;
  status: "kosong" | "terisi" | "bermasalah" | "bermasalah-terisi" | "booked";
  catatan: string | null;
  penghuni: {
    nama: string;
    noTelepon: string | null;
    tanggalMasuk: string;
  } | null;
};

type KamarDetail = {
  nomor: number;
  status: string;
  catatan: string | null;
  updatedAt: string | null;
};

export async function getAllKamar(): Promise<KamarResponse[]> {
  const res = await fetch(`${API_BASE}/kamar`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Gagal mengambil data kamar");
  return res.json();
}

export async function getKamarByNomor(
  nomor: number,
): Promise<KamarDetail | null> {
  const res = await fetch(`${API_BASE}/kamar/${nomor}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Gagal mengambil data kamar");
  return res.json();
}

export async function updateKamar(
  nomor: number,
  data: { status: string; catatan?: string | null },
): Promise<KamarDetail> {
  const res = await fetch(`${API_BASE}/kamar/${nomor}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengupdate kamar");
  return res.json();
}
