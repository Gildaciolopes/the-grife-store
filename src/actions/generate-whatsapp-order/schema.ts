import { z } from "zod";

export const generateWhatsAppOrderSchema = z.object({
  orderId: z.string(),
});

export type GenerateWhatsAppOrderSchema = z.infer<
  typeof generateWhatsAppOrderSchema
>;
