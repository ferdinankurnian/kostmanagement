import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { invitation, user } from "./auth";

export const statusKamar = pgEnum("status_kamar", [
  "kosong",
  "terisi",
  "bermasalah",
  "bermasalah-terisi",
  "booked",
]);

export const kamar = pgTable("kamar", {
  nomor: integer("no_kamar").primaryKey(),
  status: statusKamar("status").notNull().default("kosong"),
  catatan: text("catatan"),
  updatedAt: timestamp("updated_at"),
});

export const kamarRelations = relations(kamar, ({ one, many }) => ({
  penghuni: one(user, {
    fields: [kamar.nomor],
    references: [user.noKamar],
  }),
  invitations: many(invitation),
}));

export type Kamar = typeof kamar.$inferSelect;
export type NewKamar = typeof kamar.$inferInsert;
