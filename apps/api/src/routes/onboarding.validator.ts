import { z } from "zod/v4";

export const updateOnboardingSchema = z.object({
  step: z.enum(["greeting", "tour", "bayar_tagihan", "rule", "completed"]),
});
