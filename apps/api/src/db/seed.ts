const { auth } = await import("../auth");
const { createDB } = await import("./index");

import { kamar } from "./schema";

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
      console.log("ℹ️ User admin udah ada, skip.");
    } else {
      console.error("❌ Gagal bikin user:", e.message);
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

  console.log("✅ Seeding selesai!");
  process.exit(0);
}

seed();
