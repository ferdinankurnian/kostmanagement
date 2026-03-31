import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const prioritasInformasi = pgEnum("prioritas_informasi", [
  "rendah",
  "normal",
  "tinggi",
]);

export const statusInformasi = pgEnum("status_informasi", [
  "aktif",
  "nonaktif",
]);

export const informasi = pgTable("informasi", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi").notNull(),
  fotoUrls: text("foto_urls").notNull().default("[]"),
  prioritas: prioritasInformasi("prioritas").notNull().default("normal"),
  status: statusInformasi("status").notNull().default("aktif"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
