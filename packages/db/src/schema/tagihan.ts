import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { user } from "./auth";
import { kamar } from "./kamar";

export const tagihanStatus = pgEnum("tagihan_status", [
  "belum_dibayar",
  "menunggu_verifikasi",
  "lunas",
  "ditolak",
]);

export const metodePembayaran = pgEnum("metode_pembayaran", [
  "cash",
  "transfer",
]);

export const tagihan = pgTable("tagihan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  noKamar: integer("no_kamar")
    .notNull()
    .references(() => kamar.nomor),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  jumlah: integer("jumlah").notNull(),
  periode: text("periode").notNull(),
  status: tagihanStatus("status").notNull().default("belum_dibayar"),
  metodePembayaran: metodePembayaran("metode_pembayaran"),
  buktiPembayaran: text("bukti_pembayaran"),
  buktiPembayaranLastAccess: timestamp("bukti_pembayaran_last_access"),
  alasanPenolakan: text("alasan_penolakan"),
  tanggalJatuhTempo: timestamp("tanggal_jatuh_tempo").notNull(),
  tanggalBayar: timestamp("tanggal_bayar"),
  monthsPaid: integer("months_paid").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tagihanRelations = relations(tagihan, ({ one }) => ({
  user: one(user, {
    fields: [tagihan.userId],
    references: [user.id],
  }),
  kamar: one(kamar, {
    fields: [tagihan.noKamar],
    references: [kamar.nomor],
  }),
}));
