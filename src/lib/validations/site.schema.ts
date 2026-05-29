import { z } from "zod";

export const createSiteSchema = z.object({
  name: z.string().min(2).max(100),
  url: z.string().url(),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  thumbnail: z
    .union([z.string().url(), z.literal("")])
    .optional(),
  featured: z.boolean().default(false),
  status: z
    .enum(["ACTIVE", "PENDING", "REJECTED", "ARCHIVED"])
    .default("ACTIVE"),
});

export const updateSiteSchema = createSiteSchema.partial();

export type CreateSiteInput = z.input<typeof createSiteSchema>;
export type CreateSiteOutput = z.output<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
