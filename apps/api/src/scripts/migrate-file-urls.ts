import { createDB } from "@repo/db";
import { user } from "@repo/db/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const db = createDB(DATABASE_URL);

async function migrateFileUrls() {
  console.log("Starting file URL migration...");

  // Update old /api/files/ format to cdn subdomain
  const oldKtpResult = await db
    .update(user)
    .set({
      ktp: sql`REPLACE(ktp, '/api/files/', 'https://cdn.kost.iydheko.site/files/')`,
    })
    .where(sql`ktp LIKE '/api/files/%'`)
    .returning({ id: user.id });

  const oldImageResult = await db
    .update(user)
    .set({
      image: sql`REPLACE(image, '/api/files/', 'https://cdn.kost.iydheko.site/files/')`,
    })
    .where(sql`image LIKE '/api/files/%'`)
    .returning({ id: user.id });

  console.log(`Updated ${oldKtpResult.length} old KTP URLs`);
  console.log(`Updated ${oldImageResult.length} old image URLs`);

  // Update api subdomain to cdn subdomain
  const apiKtpResult = await db
    .update(user)
    .set({
      ktp: sql`REPLACE(ktp, 'https://api.kost.iydheko.site/files/', 'https://cdn.kost.iydheko.site/files/')`,
    })
    .where(sql`ktp LIKE 'https://api.kost.iydheko.site/files/%'`)
    .returning({ id: user.id });

  const apiImageResult = await db
    .update(user)
    .set({
      image: sql`REPLACE(image, 'https://api.kost.iydheko.site/files/', 'https://cdn.kost.iydheko.site/files/')`,
    })
    .where(sql`image LIKE 'https://api.kost.iydheko.site/files/%'`)
    .returning({ id: user.id });

  console.log(`Updated ${apiKtpResult.length} API KTP URLs to CDN`);
  console.log(`Updated ${apiImageResult.length} API image URLs to CDN`);

  console.log("Migration complete!");
}

migrateFileUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
