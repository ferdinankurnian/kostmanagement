import { createAuth } from "@repo/auth";
import { createDB } from "@repo/db";
import { kamar, settings } from "@repo/db/schema";

const auth = createAuth({
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:8787",
});
const db = createDB(process.env.DATABASE_URL!);

async function seed() {
  console.log("⏳ Seeding database...");

  // --- user admin ---
  try {
    const res = await auth.api.createUser({
      body: {
        email: "admin@placeholder.kost",
        password: "password123",
        name: "Pemilik Kost",
        role: "admin",
        data: { username: "admin" },
      },
    });

    if (res?.user) {
      console.log("👤 User berhasil dibuat:", res.user.name);
      console.log("👑 Role sudah diset ke:", res.user.role);
    }
  } catch (e: any) {
    if (
      e.message?.includes("already exists") ||
      e.message?.includes("duplicate")
    ) {
      console.log("ℹ️ User admin sudah ada, skip.");
    } else {
      console.error("❌ Gagal membuat user:", e.message);
    }
  }

  // --- kamar ---
  try {
    await db
      .insert(kamar)
      .values(Array.from({ length: 12 }, (_, i) => ({ nomor: i + 1 })))
      .onConflictDoNothing();

    console.log("🏠 12 kamar berhasil di-seed!");
  } catch (e: any) {
    console.error("❌ Gagal seed kamar:", e.message);
  }

  // --- settings ---
  try {
    const peraturanCards = JSON.stringify([
      {
        id: "1",
        title: "Jam Malam",
        description:
          "Jam malam dimulai pukul 22.00. Setelah itu, harap menjaga ketenangan.",
      },
      {
        id: "2",
        title: "Larangan Merokok",
        description: "Dilarang merokok di dalam kamar dan area umum.",
      },
      {
        id: "3",
        title: "Pembayaran Tagihan",
        description:
          "Pembayaran tagihan dilakukan maksimal tanggal 10 setiap bulannya.",
      },
      {
        id: "4",
        title: "Kebersihan",
        description: "Jaga kebersihan kamar dan fasilitas bersama.",
      },
      {
        id: "5",
        title: "Lapor Kerusakan",
        description: "Laporkan kerusakan fasilitas melalui fitur Keluhan.",
      },
    ]);

    await db
      .insert(settings)
      .values([
        { key: "nama_kost", value: "Andaru Kost" },
        { key: "harga_sewa", value: "1500000" },
        { key: "nama_bank", value: "BCA" },
        { key: "no_rekening", value: "1234567890" },
        { key: "nama_pemilik_rekening", value: "Rina" },
        {
          key: "peraturan_kost_cards",
          value: peraturanCards,
        },
        { key: "security_pin", value: "1234" },
      ])
      .onConflictDoNothing();

    console.log("⚙️ Settings berhasil di-seed!");
  } catch (e: any) {
    console.error("❌ Gagal seed settings:", e.message);
  }

  console.log("✅ Seeding selesai!");
  process.exit(0);
}

seed();
