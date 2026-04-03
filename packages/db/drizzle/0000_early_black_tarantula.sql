CREATE TYPE "public"."ktp_verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status" AS ENUM('greeting', 'tour', 'bayar_tagihan', 'rule', 'completed');--> statement-breakpoint
CREATE TYPE "public"."prioritas_informasi" AS ENUM('rendah', 'normal', 'tinggi');--> statement-breakpoint
CREATE TYPE "public"."status_informasi" AS ENUM('aktif', 'nonaktif');--> statement-breakpoint
CREATE TYPE "public"."status_kamar" AS ENUM('kosong', 'terisi', 'bermasalah', 'bermasalah-terisi', 'booked');--> statement-breakpoint
CREATE TYPE "public"."status_keluhan" AS ENUM('dibuka', 'diproses', 'selesai');--> statement-breakpoint
CREATE TYPE "public"."metode_pembayaran" AS ENUM('cash', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."tagihan_status" AS ENUM('belum_dibayar', 'menunggu_verifikasi', 'lunas', 'ditolak');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"no_kamar" integer NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expired_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"no_telepon" text,
	"no_telepon_darurat" text,
	"ktp" text,
	"ktp_status" "ktp_verification_status" DEFAULT 'pending',
	"ktp_rejection_reason" text,
	"no_kamar" integer,
	"onboarding" "onboarding_status" DEFAULT 'greeting',
	"bayar_sampai" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "informasi" (
	"id" text PRIMARY KEY NOT NULL,
	"judul" text NOT NULL,
	"deskripsi" text NOT NULL,
	"foto_urls" text DEFAULT '[]' NOT NULL,
	"prioritas" "prioritas_informasi" DEFAULT 'normal' NOT NULL,
	"status" "status_informasi" DEFAULT 'aktif' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kamar" (
	"no_kamar" integer PRIMARY KEY NOT NULL,
	"status" "status_kamar" DEFAULT 'kosong' NOT NULL,
	"catatan" text,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "keluhan" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"no_kamar" integer NOT NULL,
	"judul" text NOT NULL,
	"deskripsi" text NOT NULL,
	"foto_urls" text DEFAULT '[]' NOT NULL,
	"status" "status_keluhan" DEFAULT 'dibuka' NOT NULL,
	"catatan_pemilik" text,
	"selesai_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_read" (
	"id" text PRIMARY KEY NOT NULL,
	"notification_key" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tagihan" (
	"id" text PRIMARY KEY NOT NULL,
	"no_kamar" integer NOT NULL,
	"user_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"periode" text NOT NULL,
	"status" "tagihan_status" DEFAULT 'belum_dibayar' NOT NULL,
	"metode_pembayaran" "metode_pembayaran",
	"bukti_pembayaran" text,
	"bukti_pembayaran_last_access" timestamp,
	"alasan_penolakan" text,
	"tanggal_jatuh_tempo" timestamp NOT NULL,
	"tanggal_bayar" timestamp,
	"months_paid" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_no_kamar_kamar_no_kamar_fk" FOREIGN KEY ("no_kamar") REFERENCES "public"."kamar"("no_kamar") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keluhan" ADD CONSTRAINT "keluhan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keluhan" ADD CONSTRAINT "keluhan_no_kamar_kamar_no_kamar_fk" FOREIGN KEY ("no_kamar") REFERENCES "public"."kamar"("no_kamar") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_read" ADD CONSTRAINT "notification_read_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_no_kamar_kamar_no_kamar_fk" FOREIGN KEY ("no_kamar") REFERENCES "public"."kamar"("no_kamar") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "notification_read_userId_idx" ON "notification_read" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_read_userId_notificationKey_idx" ON "notification_read" USING btree ("user_id","notification_key");