import { createDB } from "@repo/db";
import { settings, tagihan, user } from "@repo/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";

interface Env {
  DATABASE_URL: string;
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

  const jatuhTempo = new Date(now.getFullYear(), now.getMonth(), 10);

  let created = 0;

  for (const p of penghuniList) {
    if (!p.noKamar) continue;

    // Skip if penghuni has paid ahead
    if (p.bayarSampai && new Date(p.bayarSampai) > jatuhTempo) continue;

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
}
