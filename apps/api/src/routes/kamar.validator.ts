import { z } from "zod/v4";

export const updateKamarSchema = z.object({
  status: z.enum([
    "kosong",
    "terisi",
    "bermasalah",
    "bermasalah-terisi",
    "booked",
  ]),
  catatan: z.string().nullable().optional(),
});

export const removePenghuniSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
});
