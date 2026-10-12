import { translator } from "./i18n";
import type { Locale } from "./i18n/routing";
import { z } from "zod";
export const requestSchema = z.object({
  service_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()\-]{8,22}$/),
  location: z.string().trim().min(3).max(240),
  desired_at: z.string().max(40).optional().default(""),
  note: z.string().trim().max(2000).optional().default(""),
  website: z.string().max(0).optional().default(""),
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
