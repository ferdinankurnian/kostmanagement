import { api, readApiResponse } from "@/lib/api";

export type KeluhanStatus = "dibuka" | "diproses" | "selesai";

export interface Keluhan {
  id: string;
  userId: string;
  noKamar: number;
  judul: string;
  deskripsi: string;
  fotoUrls: string[];
  status: KeluhanStatus;
  catatanPemilik: string | null;
  selesaiAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  namaPenghuni: string;
}

export async function getKeluhanList(): Promise<Keluhan[]> {
  const response = await api.api.keluhan.$get();
  return readApiResponse<Keluhan[]>(response, "Gagal mengambil keluhan");
}

export async function getKeluhanById(id: string): Promise<Keluhan> {
  const response = await api.api.keluhan[":id"].$get({
    param: { id },
  });
  return readApiResponse<Keluhan>(response, "Gagal mengambil detail keluhan");
}

export async function createKeluhan(data: {
  judul: string;
  deskripsi: string;
  fotoUrls?: string[];
}): Promise<Keluhan> {
  const response = await api.api.keluhan.$post({
    json: data,
  });
  return readApiResponse<Keluhan>(response, "Gagal membuat keluhan");
}

export async function updateStatusKeluhan(
  id: string,
  data: {
    status: KeluhanStatus;
    catatanPemilik?: string | null;
  },
): Promise<Keluhan> {
  const response = await api.api.keluhan[":id"].status.$put({
    param: { id },
    json: data,
  });
  return readApiResponse<Keluhan>(response, "Gagal mengubah status keluhan");
}

export async function deleteKeluhan(id: string): Promise<void> {
  const response = await api.api.keluhan[":id"].$delete({
    param: { id },
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(error?.error || "Gagal menghapus keluhan");
  }
}
