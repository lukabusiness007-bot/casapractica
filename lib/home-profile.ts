import { z } from "zod";
export const homeProfileSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(240),
  property_type: z.enum(["apartment", "house"]),
  appliances: z.string().trim().max(1500).default(""),
  preferences: z.string().trim().max(1500).default(""),
  future_tasks: z.string().trim().max(1500).default(""),
  maintenance_due: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.iso.date().nullable(),
  ),
});
export type HomeProfile = z.infer<typeof homeProfileSchema>;
