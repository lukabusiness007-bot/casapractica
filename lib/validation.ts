import { attributionSchema } from "./attribution";
import { translator } from "./i18n";
import type { Locale } from "./i18n/routing";
import { z } from "zod";
import { isRetiredServiceId, packageServiceId, services } from "./catalog";
import { isPestService } from "./pest-services";
import { packageSchema } from "./packages";
import { commerceSchema } from "./growth";
export const requestSchema = z
  .object({
    service_id: z.string().uuid(),
    name: z.string().trim().min(2).max(100),
    email: z
      .preprocess(
        (v) => (v === "" || v == null ? null : v),
        z
          .string()
          .trim()
          .email()
          .max(254)
          .transform((v) => v.toLowerCase())
          .nullable(),
      )
      .optional()
      .default(null),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()\-]{8,22}$/),
    location: z.string().trim().min(3).max(240),
    desired_at: z.string().max(40).optional().default(""),
    note: z.string().trim().max(2000).optional().default(""),
    website: z.string().max(0).optional().default(""),
    package: packageSchema.optional(),
    commerce: commerceSchema.optional(),
    analytics_session_id: z.string().uuid().optional(),
    attribution: attributionSchema.optional(),
  })
  .superRefine((input, context) => {
    const primary = services.find(service => service.id === input.service_id);
    const pestRequest = (primary && isPestService(primary.slug)) || input.commerce?.collection_id?.startsWith("zastita-");
    if (pestRequest && !input.commerce?.pest_assessment)
      context.addIssue({ code: "custom", path: ["commerce", "pest_assessment"], message: "Proverite izbor obima." });
    if (isRetiredServiceId(input.service_id))
      context.addIssue({
        code: "custom",
        path: ["service_id"],
        message: "Usluga nije dostupna.",
      });
    if (
      input.commerce?.subscription_id &&
      input.service_id !== packageServiceId
    )
      context.addIssue({
        code: "custom",
        path: ["service_id"],
        message: "Proverite izbor plana.",
      });
    if (
      (input.service_id === packageServiceId &&
        (!input.commerce || input.commerce.intent === "service")) !==
      Boolean(input.package)
    )
      context.addIssue({
        code: "custom",
        path: ["package"],
        message: "Proverite izbor usluga u paketu.",
      });
  });
export function finalAmount(base: number, discount: number) {
  if (
    !Number.isSafeInteger(base) ||
    !Number.isSafeInteger(discount) ||
    base <= 0 ||
    discount < 0 ||
    discount >= base
  )
    throw new Error("Neispravan iznos ponude.");
  return base - discount;
}
export function safeReturn(value: string | null) {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/nalog";
}
export function whatsappLink(
  number: string,
  service: string,
  reference: string,
  locale: Locale = "sr",
) {
  if (!/^\d{8,15}$/.test(number)) return null;
  const t = translator(locale);
  return `https://wa.me/${number}?text=${encodeURIComponent(`${t("Zdravo! Želim da dogovorim uslugu:")} ${t(service)}. ${t("Broj mog zahteva je")} ${reference}.`)}`;
}
