const API_BASE = "http://localhost:8787/api";

export async function uploadKTP(data: {
  fileName: string;
  fileType: string;
  base64: string;
}): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/upload/ktp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengupload KTP");
  }
  return res.json();
}
