import type { Informasi } from "@/lib/informasi";
import type { Keluhan } from "@/lib/keluhan";
import type { NotificationRole } from "@/lib/pwa-notifications";
import type { Tagihan } from "@/lib/tagihan";

export interface AppNotification {
  createdAt: string;
  description: string;
  href: string;
  id: string;
  kind: "informasi" | "keluhan" | "tagihan";
  title: string;
}

interface NotificationSourceData {
  informasi: Informasi[];
  keluhan: Keluhan[];
  tagihan: Tagihan[];
}

function getEventDate(...dates: Array<string | null | undefined>) {
  for (const date of dates) {
    if (date) {
      return date;
    }
  }

  return new Date(0).toISOString();
}

function getDueStatusLabel(date: string) {
  const dueAt = new Date(date);
  const now = new Date();
  const diffInDays = Math.ceil(
    (dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays < 0) {
    return "Tagihan sudah melewati jatuh tempo.";
  }

  if (diffInDays === 0) {
    return "Tagihan jatuh tempo hari ini.";
  }

  if (diffInDays <= 3) {
    return `Tagihan jatuh tempo ${diffInDays} hari lagi.`;
  }

  return `Jatuh tempo pada ${dueAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}.`;
}

function sortNotifications(items: AppNotification[]) {
  return [...items].sort((left, right) => {
    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

function buildPemilikNotifications({
  informasi,
  keluhan,
  tagihan,
}: NotificationSourceData) {
  const tagihanNotifications = tagihan.flatMap((item) => {
    const eventDate = getEventDate(item.updatedAt, item.createdAt);

    switch (item.status) {
      case "menunggu_verifikasi":
        return [
          {
            createdAt: eventDate,
            description: `Kamar ${item.noKamar} mengirim bukti pembayaran untuk periode ${item.periode}.`,
            href: "/pemilik/tagihan",
            id: `tagihan:${item.id}:${item.status}:${eventDate}`,
            kind: "tagihan" as const,
            title: "Pembayaran menunggu verifikasi",
          },
        ];
      case "belum_dibayar":
        return [
          {
            createdAt: item.tanggalJatuhTempo,
            description: `Kamar ${item.noKamar} belum membayar periode ${item.periode}. ${getDueStatusLabel(item.tanggalJatuhTempo)}`,
            href: "/pemilik/tagihan",
            id: `tagihan:${item.id}:${item.status}:${item.tanggalJatuhTempo}`,
            kind: "tagihan" as const,
            title: "Tagihan belum dibayar",
          },
        ];
      case "lunas":
        return [
          {
            createdAt: eventDate,
            description: `Pembayaran kamar ${item.noKamar} untuk periode ${item.periode} sudah lunas.`,
            href: "/pemilik/tagihan",
            id: `tagihan:${item.id}:${item.status}:${eventDate}`,
            kind: "tagihan" as const,
            title: "Tagihan berhasil dilunasi",
          },
        ];
      case "ditolak":
        return [];
      default:
        return [];
    }
  });

  const keluhanNotifications = keluhan.map((item) => {
    const eventDate = getEventDate(item.updatedAt, item.createdAt);

    return {
      createdAt: eventDate,
      description: `Keluhan "${item.judul}" dari kamar ${item.noKamar} sedang ${item.status === "dibuka" ? "menunggu penanganan" : item.status}.`,
      href: `/pemilik/keluhan/detail?id=${item.id}`,
      id: `keluhan:${item.id}:${item.status}:${eventDate}`,
      kind: "keluhan" as const,
      title:
        item.status === "dibuka"
          ? "Keluhan baru masuk"
          : item.status === "diproses"
            ? "Keluhan sedang diproses"
            : "Keluhan selesai",
    };
  });

  const informasiNotifications = informasi.map((item) => {
    const eventDate = getEventDate(item.updatedAt, item.createdAt);

    return {
      createdAt: eventDate,
      description: `"${item.judul}" saat ini ${item.status === "aktif" ? "aktif" : "nonaktif"} untuk penghuni.`,
      href: `/pemilik/informasi/detail?id=${item.id}`,
      id: `informasi:${item.id}:${item.status}:${eventDate}`,
      kind: "informasi" as const,
      title: "Informasi kost diperbarui",
    };
  });

  return sortNotifications([
    ...tagihanNotifications,
    ...keluhanNotifications,
    ...informasiNotifications,
  ]);
}

function buildPenghuniNotifications({
  informasi,
  keluhan,
  tagihan,
}: NotificationSourceData) {
  const tagihanNotifications = tagihan.map((item) => {
    const eventDate = getEventDate(item.updatedAt, item.createdAt);

    return {
      createdAt: eventDate,
      description:
        item.status === "belum_dibayar"
          ? `Periode ${item.periode} untuk kamar ${item.noKamar} belum dibayar. ${getDueStatusLabel(item.tanggalJatuhTempo)}`
          : item.status === "menunggu_verifikasi"
            ? `Pembayaran periode ${item.periode} sedang dicek pemilik.`
            : item.status === "ditolak"
              ? `Pembayaran periode ${item.periode} ditolak.${item.alasanPenolakan ? ` Alasan: ${item.alasanPenolakan}` : ""}`
              : `Pembayaran periode ${item.periode} sudah diterima.`,
      href: "/penghuni/tagihan",
      id: `tagihan:${item.id}:${item.status}:${eventDate}`,
      kind: "tagihan" as const,
      title:
        item.status === "belum_dibayar"
          ? "Tagihan perlu dibayar"
          : item.status === "menunggu_verifikasi"
            ? "Pembayaran sedang diverifikasi"
            : item.status === "ditolak"
              ? "Pembayaran ditolak"
              : "Tagihan sudah lunas",
    };
  });

  const keluhanNotifications = keluhan.map((item) => {
    const eventDate = getEventDate(item.updatedAt, item.createdAt);

    return {
      createdAt: eventDate,
      description:
        item.status === "dibuka"
          ? `Keluhan "${item.judul}" berhasil dikirim dan menunggu respon pemilik.`
          : item.status === "diproses"
            ? `Keluhan "${item.judul}" sedang ditangani.${item.catatanPemilik ? ` Catatan: ${item.catatanPemilik}` : ""}`
            : `Keluhan "${item.judul}" sudah selesai.${item.catatanPemilik ? ` Catatan: ${item.catatanPemilik}` : ""}`,
      href: `/penghuni/keluhan/detail?id=${item.id}`,
      id: `keluhan:${item.id}:${item.status}:${eventDate}`,
      kind: "keluhan" as const,
      title:
        item.status === "dibuka"
          ? "Keluhan berhasil dikirim"
          : item.status === "diproses"
            ? "Keluhan sedang diproses"
            : "Keluhan selesai",
    };
  });

  const informasiNotifications = informasi.map((item) => ({
    createdAt: getEventDate(item.updatedAt, item.createdAt),
    description: item.deskripsi,
    href: "/penghuni",
    id: `informasi:${item.id}:${item.status}:${item.createdAt}`,
    kind: "informasi" as const,
    title: item.judul,
  }));

  return sortNotifications([
    ...tagihanNotifications,
    ...keluhanNotifications,
    ...informasiNotifications,
  ]);
}

export function buildNotificationFeed(
  role: NotificationRole,
  sourceData: NotificationSourceData,
) {
  return role === "pemilik"
    ? buildPemilikNotifications(sourceData)
    : buildPenghuniNotifications(sourceData);
}
