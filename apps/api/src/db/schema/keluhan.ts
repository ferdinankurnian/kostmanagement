import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { user } from "./auth";
import { kamar } from "./kamar";

export const statusKeluhan = pgEnum("status_keluhan", [
  "dibuka",
  "diproses",
  "selesai",
]);

export const keluhan = pgTable("keluhan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  noKamar: integer("no_kamar")
    .notNull()
    .references(() => kamar.nomor),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi").notNull(),
  fotoUrls: text("foto_urls").notNull().default("[]"),
  status: statusKeluhan("status").notNull().default("dibuka"),
  catatanPemilik: text("catatan_pemilik"),
  selesaiAt: timestamp("selesai_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const keluhanRelations = relations(keluhan, ({ one }) => ({
  user: one(user, {
    fields: [keluhan.userId],
    references: [user.id],
  }),
  kamar: one(kamar, {
    fields: [keluhan.noKamar],
    references: [kamar.nomor],
  }),
}));
