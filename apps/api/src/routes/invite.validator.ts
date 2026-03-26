import { z } from "zod/v4";

export const createInviteSchema = z.object({
  name: z.string().min(1),
  noKamar: z.number().min(1).max(12),
});

export const validateInviteSchema = z.object({
  code: z.string(),
});

export const useInviteSchema = z.object({
  code: z.string(),
});

export const getInviteSchema = z.object({
  id: z.string(),
});
