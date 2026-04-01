import { API_BASE } from "@/lib/config";

const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type UploadTarget = "ktp" | "bukti" | "avatar";

type CompressionOptions = {
  maxDimension: number;
  maxBytes: number;
};

export async function uploadKTP(file: File): Promise<{ url: string }> {
  const preparedFile = await prepareImageForUpload(file, {
    maxDimension: 1800,
    maxBytes: 1_200_000,
  });

  const res = await fetch(`${API_BASE}/upload/ktp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: preparedFile.name,
      fileType: preparedFile.type,
      base64: await fileToBase64(preparedFile),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengupload KTP");
  }

  return res.json();
}

export async function verifyKTP(data: {
  noKamar: number;
  status: "approved" | "rejected";
  reason?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/upload/ktp/verify`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal verifikasi KTP");
  }

  return res.json();
}

export async function uploadBukti(file: File): Promise<string> {
  const data = await uploadPreparedFile(file, "bukti", {
    maxDimension: 1600,
    maxBytes: 900_000,
  });
  return data.url as string;
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  return uploadPreparedFile(file, "avatar", {
    maxDimension: 512,
    maxBytes: 300_000,
  });
}

async function uploadPreparedFile(
  file: File,
  target: UploadTarget,
  options: CompressionOptions,
): Promise<{ url: string }> {
  const preparedFile = await prepareImageForUpload(file, options);
  const res = await fetch(`${API_BASE}/upload/${target}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: preparedFile.name,
      fileType: preparedFile.type,
      base64: await fileToBase64(preparedFile),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal upload file");
  }

  return res.json();
}

async function prepareImageForUpload(
  file: File,
  options: CompressionOptions,
): Promise<File> {
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) {
    return file;
  }

  if (file.size <= options.maxBytes) {
    return file;
  }

  const image = await loadImage(file);
  let scale = Math.min(
    1,
    options.maxDimension / Math.max(image.width, image.height),
  );
  let quality = 0.82;
  let blob = await renderCompressedBlob(image, scale, quality);

  while (blob.size > options.maxBytes && quality > 0.45) {
    quality -= 0.08;
    blob = await renderCompressedBlob(image, scale, quality);
  }

  while (blob.size > options.maxBytes && scale > 0.45) {
    scale *= 0.85;
    quality = Math.min(quality, 0.76);
    blob = await renderCompressedBlob(image, scale, quality);
  }

  if (blob.size >= file.size) {
    return file;
  }

  return new File([blob], renameFileToWebP(file.name), {
    type: blob.type,
    lastModified: file.lastModified,
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    image.src = url;
  });
}

async function renderCompressedBlob(
  image: HTMLImageElement,
  scale: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas tidak tersedia untuk kompresi gambar");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });

  if (!blob) {
    throw new Error("Gagal mengompres gambar");
  }

  return blob;
}

function renameFileToWebP(fileName: string) {
  return `${fileName.replace(/\.[^.]+$/, "")}.webp`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
