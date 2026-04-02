import { createDB } from "@repo/db";
import {
  informasi,
  keluhan,
  notificationRead,
  settings,
  tagihan,
  user,
} from "@repo/db/schema";
import { and, eq, isNotNull, lt } from "drizzle-orm";

interface Env {
  DATABASE_URL: string;
  ALWAYS_PERSISTENCE_KOST_DATA?: string;
  R2_BUCKET: R2Bucket;
}

export async function handleScheduled(env: Env) {
  const db = createDB(env.DATABASE_URL);

  // Read harga_sewa from settings
  const hargaRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "harga_sewa"))
    .limit(1);

  const hargaSewa = parseInt(hargaRow[0]?.value ?? "0");
  if (hargaSewa <= 0) return;

  // Get all active penghuni
  const penghuniList = await db
    .select()
    .from(user)
    .where(and(eq(user.role, "user"), isNotNull(user.noKamar)));

  const now = new Date();
  const periode = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(now);

  // Last day of current month (28/29/30/31 depending on month)
  const jatuhTempo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  let created = 0;

  for (const p of penghuniList) {
    if (!p.noKamar) continue;

    // Skip if penghuni has paid ahead
    if (p.bayarSampai && new Date(p.bayarSampai) >= jatuhTempo) continue;

    // Check if tagihan for this periode already exists
    const existing = await db
      .select()
      .from(tagihan)
      .where(and(eq(tagihan.noKamar, p.noKamar), eq(tagihan.periode, periode)))
      .limit(1);

    if (existing[0]) continue;

    await db.insert(tagihan).values({
      noKamar: p.noKamar,
      userId: p.id,
      jumlah: hargaSewa,
      periode,
      tanggalJatuhTempo: jatuhTempo,
    });

    created++;
  }

  console.log(`[CRON] Generated ${created} tagihan for ${periode}`);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const cleanupResult = await db
    .delete(notificationRead)
    .where(lt(notificationRead.readAt, sevenDaysAgo))
    .returning();

  console.log(
    `[CRON] Cleaned up ${cleanupResult.length} read notification records older than 7 days`,
  );

  // Cleanup inactive photos from R2
  if (env.ALWAYS_PERSISTENCE_KOST_DATA !== "true") {
    await cleanupInactivePhotos(env, db);
  } else {
    console.log(
      "[CRON] ALWAYS_PERSISTENCE_KOST_DATA=true, skipping photo cleanup",
    );
  }
}

function extractKeyFromUrl(url: string): string | null {
  const match = url.match(/\/files\/([^?]+)/);
  return match ? match[1] : null;
}

function parseFotoUrls(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed;
    }
  } catch {
    // Fallback for legacy comma-separated values
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function cleanupInactivePhotos(
  env: Env,
  db: ReturnType<typeof createDB>,
) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 1. Clean buktiPembayaran from paid tagihan older than 30 days
  const oldTagihan = await db
    .select({ id: tagihan.id, buktiPembayaran: tagihan.buktiPembayaran })
    .from(tagihan)
    .where(
      and(
        eq(tagihan.status, "lunas"),
        lt(tagihan.updatedAt, thirtyDaysAgo),
        isNotNull(tagihan.buktiPembayaran),
      ),
    );

  for (const t of oldTagihan) {
    if (t.buktiPembayaran) {
      const key = extractKeyFromUrl(t.buktiPembayaran);
      if (key) {
        console.log("[CRON] Deleting old bukti from R2:", key);
        await env.R2_BUCKET.delete(key);
      }
    }
    await db
      .update(tagihan)
      .set({ buktiPembayaran: null })
      .where(eq(tagihan.id, t.id));
  }
  console.log(`[CRON] Cleaned up ${oldTagihan.length} old bukti pembayaran`);

  // 2. Clean fotoUrls from nonaktif informasi older than 30 days
  const oldInformasi = await db
    .select({ id: informasi.id, fotoUrls: informasi.fotoUrls })
    .from(informasi)
    .where(
      and(
        eq(informasi.status, "nonaktif"),
        lt(informasi.updatedAt, thirtyDaysAgo),
      ),
    );

  for (const info of oldInformasi) {
    if (info.fotoUrls && info.fotoUrls !== "[]") {
      const urls = parseFotoUrls(info.fotoUrls);
      for (const url of urls) {
        const key = extractKeyFromUrl(url);
        if (key) {
          console.log("[CRON] Deleting old informasi foto from R2:", key);
          await env.R2_BUCKET.delete(key);
        }
      }
    }
    await db
      .update(informasi)
      .set({ fotoUrls: "[]" })
      .where(eq(informasi.id, info.id));
  }
  console.log(`[CRON] Cleaned up ${oldInformasi.length} old informasi fotos`);

  // 3. Clean fotoUrls from selesai keluhan older than 30 days
  const oldKeluhan = await db
    .select({
      id: keluhan.id,
      fotoUrls: keluhan.fotoUrls,
      selesaiAt: keluhan.selesaiAt,
    })
    .from(keluhan)
    .where(
      and(
        eq(keluhan.status, "selesai"),
        isNotNull(keluhan.selesaiAt),
        lt(keluhan.selesaiAt, thirtyDaysAgo),
      ),
    );

  for (const k of oldKeluhan) {
    if (k.fotoUrls && k.fotoUrls !== "[]") {
      const urls = parseFotoUrls(k.fotoUrls);
      for (const url of urls) {
        const key = extractKeyFromUrl(url);
        if (key) {
          console.log("[CRON] Deleting old keluhan foto from R2:", key);
          await env.R2_BUCKET.delete(key);
        }
      }
    }
    await db
      .update(keluhan)
      .set({ fotoUrls: "[]" })
      .where(eq(keluhan.id, k.id));
  }
  console.log(`[CRON] Cleaned up ${oldKeluhan.length} old keluhan fotos`);

  console.log("[CRON] Photo cleanup complete");
}
