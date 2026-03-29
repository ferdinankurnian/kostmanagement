import { api, readApiResponse } from "@/lib/api";

export type PrioritasInformasi = "rendah" | "normal" | "tinggi";
export type StatusInformasi = "aktif" | "nonaktif";

export interface Informasi {
  id: string;
  judul: string;
  deskripsi: string;
  fotoUrls: string[];
  prioritas: PrioritasInformasi;
  status: StatusInformasi;
  createdAt: string;
  updatedAt: string | null;
}

export async function getInformasiList(): Promise<Informasi[]> {
  const response = await api.api.informasi.$get();
  return readApiResponse<Informasi[]>(response, "Gagal mengambil informasi");
}

export async function getInformasiById(id: string): Promise<Informasi> {
  const response = await api.api.informasi[":id"].$get({
    param: { id },
  });
  return readApiResponse<Informasi>(
    response,
    "Gagal mengambil detail informasi",
  );
}

export async function createInformasi(data: {
  judul: string;
  deskripsi: string;
  fotoUrls?: string[];
  prioritas: PrioritasInformasi;
  status: StatusInformasi;
}): Promise<Informasi> {
  const response = await api.api.informasi.$post({
    json: data,
  });
  return readApiResponse<Informasi>(response, "Gagal membuat informasi");
}

export async function updateInformasi(
  id: string,
  data: {
    judul: string;
    deskripsi: string;
    fotoUrls?: string[];
    prioritas: PrioritasInformasi;
    status: StatusInformasi;
  },
): Promise<Informasi> {
  const response = await api.api.informasi[":id"].$put({
    param: { id },
    json: data,
  });
  return readApiResponse<Informasi>(response, "Gagal mengubah informasi");
}

export async function deleteInformasi(id: string): Promise<void> {
  const response = await api.api.informasi[":id"].$delete({
    param: { id },
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(error?.error || "Gagal menghapus informasi");
  }
}
