import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { user, account } from "./schema";
import { hash } from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

// Konfigurasi akun pemilik (ganti sesuai kebutuhan)
const OWNER_CONFIG = {
	username: "pemilik",
	name: "Pemilik Kost",
	password: "admin123", // ganti password ini!
	namaKost: "rumahkita", // untuk email dummy: pemilik@rumahkita.kost
};

async function seed() {
	console.log("🌱 Seeding database...\n");

	const email = `${OWNER_CONFIG.username}@${OWNER_CONFIG.namaKost}.kost`;

	// Cek apakah user sudah ada
	const existingUser = await db
		.select()
		.from(user)
		.where((u) => u.username === OWNER_CONFIG.username || u.email === email);

	if (existingUser.length > 0) {
		console.log("⚠️  User pemilik sudah ada:");
		console.log(`   Username: ${existingUser[0].username}`);
		console.log(`   Email: ${existingUser[0].email}`);
		console.log("\n✅ Seeding skipped (user already exists)");
		process.exit(0);
	}

	// Generate ID (better-auth pake cuid/ulid, kita simulasikan)
	const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const now = new Date();

	// Hash password (better-auth pake bcrypt/scrypt)
	const hashedPassword = await hash(OWNER_CONFIG.password, 10);

	// Insert user
	await db.insert(user).values({
		id: userId,
		name: OWNER_CONFIG.name,
		email: email,
		emailVerified: true,
		username: OWNER_CONFIG.username,
		displayUsername: OWNER_CONFIG.username,
		role: "admin",
		image: null,
		createdAt: now,
		updatedAt: now,
	});

	// Insert account (untuk credentials)
	await db.insert(account).values({
		id: accountId,
		userId: userId,
		accountId: OWNER_CONFIG.username,
		providerId: "credential",
		password: hashedPassword,
		createdAt: now,
		updatedAt: now,
	});

	console.log("✅ Akun pemilik berhasil dibuat!\n");
	console.log("📋 Detail Login:");
	console.log(`   Username: ${OWNER_CONFIG.username}`);
	console.log(`   Password: ${OWNER_CONFIG.password}`);
	console.log(`   Email: ${email} (dummy)`);
	console.log(`   Role: admin\n`);

	console.log("⚠️  PENTING: Ganti password setelah login pertama kali!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("❌ Seeding failed:", err);
	process.exit(1);
});
