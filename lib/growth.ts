import { z } from "zod";
import { findSubscription } from "./subscriptions";
import type { Service } from "./catalog";

export const collections = [
  {
    id: "filmsko-vece",
    name: "Filmsko veče, spremno",
    description: "Televizor, povezivanje zvuka i polica za vaš omiljeni kutak.",
    image: "/images/hero.jpg",
    slugs: ["ugradnja-tv-a", "podesavanje-tv-a", "montaza-polica"],
  },
  {
    id: "povratak-kuci",
    name: "Povratak kući",
    description:
      "Briga tokom odsustva, sveža posteljina i namirnice za vaš povratak.",
    image: "/images/hero.jpg",
    slugs: ["dom-na-cuvanju", "sveza-posteljina", "licna-nabavka"],
  },
  {
    id: "gosti-stizu",
    name: "Gosti stižu",
    description:
      "Pripremljen prostor, gostinska posteljina i nabavka prema vašoj listi.",
    image: "/images/kitchen.jpg",
    slugs: ["dom-spreman-za-goste", "sveza-posteljina", "licna-nabavka"],
  },
  {
    id: "nova-sezona",
    name: "Nova sezona",
    description:
      "Organizovan garderober, negovana odeća i sezonsko održavanje.",
    image: "/images/club.jpg",
    slugs: ["organizacija-doma", "nega-garderobe", "servis-klime"],
  },
  {
    id: "useljenje",
    name: "Useljenje sa lakoćom",
    description:
      "Raspakivanje, sklapanje nameštaja i pažljivo postavljene slike i ogledala.",
    image: "/images/hero.jpg",
    slugs: [
      "pakovanje-i-raspakivanje",
      "sklapanje-namestaja",
      "kacenje-slika-i-ogledala",
    ],
  },
] as const;
export const upgrades = [
  {
    id: "hidden-cables",
    slug: "ugradnja-tv-a",
    name: "Skrivanje kablova u zidu",
    description:
      "Dodatni rad nakon provere zida; obim i doplatu potvrđujete pre dolaska.",
  },
  {
    id: "all-bedrooms",
    slug: "sveza-posteljina",
    name: "Sve spavaće sobe",
    description:
      "Priprema više kreveta i gostinske sobe, prema dogovorenom broju.",
  },
  {
    id: "seasonal-wardrobe",
    slug: "organizacija-doma",
    name: "Sezonska reorganizacija",
    description:
      "Dodatno sortiranje i pakovanje sezonske odeće u dogovorenom obimu.",
  },
] as const;
const related: Record<string, string[]> = {
  "ugradnja-tv-a": ["podesavanje-tv-a", "montaza-polica"],
  "podesavanje-tv-a": ["ugradnja-tv-a", "podesavanje-wifi-mreze"],
  "organizacija-doma": ["nega-garderobe", "paketi-i-hemijsko-ciscenje"],
  "nega-garderobe": ["sveza-posteljina", "organizacija-doma"],
  "sveza-posteljina": ["nega-garderobe", "dom-spreman-za-goste"],
  "dom-na-cuvanju": ["sveza-posteljina", "licna-nabavka"],
  "servis-klime": ["odrzavanje-filtera", "zamena-sijalica"],
  "sklapanje-namestaja": ["kacenje-slika-i-ogledala", "montaza-polica"],
  "dom-spreman-za-goste": ["sveza-posteljina", "licna-nabavka"],
};
export function relatedServices(
  service: Pick<Service, "slug">,
  available: Service[],
) {
  return (related[service.slug] || [])
    .flatMap((slug) =>
      available.filter((item) => item.active && item.slug === slug),
    )
    .slice(0, 2);
}
export const commerceSchema = z
  .object({
    intent: z
      .enum(["service", "visit", "managed", "plan-change"])
      .default("service"),
    subscription_id: z.enum(["garderoba", "ritam", "na-cuvanju", "family"]).optional(),
    tier: z.enum(["once", "signature", "private"]).optional(),
    collection_id: z
      .enum([
        "filmsko-vece",
        "povratak-kuci",
        "gosti-stizu",
        "nova-sezona",
        "useljenje",
      ])
      .optional(),
    additional_service_ids: z
      .array(z.string().uuid())
      .max(2)
      .default([])
      .refine((ids) => new Set(ids).size === ids.length),
    upgrade_ids: z
      .array(z.enum(["hidden-cables", "all-bedrooms", "seasonal-wardrobe"]))
      .max(1)
      .default([]),
    booked_for: z.enum(["self", "assistant"]).default("self"),
    contact_preference: z.enum(["phone", "whatsapp"]).default("phone"),
    follow_up_opt_in: z.boolean().default(false),
    plan_change: z.enum(["pause", "less-often", "seasonal"]).optional(),
    referral_code: z
      .string()
      .regex(/^[a-f0-9]{12}$/)
      .optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.subscription_id && (value.tier || !["managed", "plan-change"].includes(value.intent)))
      context.addIssue({ code: "custom", message: "Proverite izbor plana." });
    if ((value.intent === "plan-change") !== Boolean(value.plan_change))
      context.addIssue({ code: "custom", message: "Proverite izbor plana." });
  });
export type CommerceInput = z.input<typeof commerceSchema>;
export type Commerce = z.infer<typeof commerceSchema>;
export function commerceNote(
  commerce: Commerce,
  primary: Pick<Service, "id" | "slug">,
  available: Service[],
) {
  const lines: string[] = [];
  if (commerce.subscription_id) {
    if (primary.slug !== "moja-casa") throw new Error("Proverite izbor plana.");
    const subscription = findSubscription(commerce.subscription_id)!;
    lines.push(`Mesečni paket: ${subscription.name}`);
    lines.push(`Informativna mesečna cena: ${(subscription.price / 100).toFixed(2)} RSD`);
    lines.push(...subscription.includes.map((item) => `• ${item}`));
    lines.push(`Posebno: ${subscription.excludes}`);
    lines.push("Početak i naplata nakon potvrde ponude; ovaj zahtev ne aktivira automatsku pretplatu.");
  }
  for (const id of commerce.additional_service_ids) {
    const service = available.find(
      (service) => service.id === id && service.active,
    );
    if (
      !service ||
      !relatedServices(primary, available).some((item) => item.id === id)
    )
      throw new Error("Proverite izbor dopuna.");
    lines.push(`Dodatna usluga: ${service.name}`);
  }
  for (const id of commerce.upgrade_ids) {
    const upgrade = upgrades.find(
      (item) => item.id === id && item.slug === primary.slug,
    );
    if (!upgrade) throw new Error("Proverite izbor dopuna.");
    lines.push(`Dopuna: ${upgrade.name}`);
  }
  if (commerce.collection_id)
    lines.push(
      `Kolekcija: ${collections.find((item) => item.id === commerce.collection_id)!.name}`,
    );
  if (commerce.intent !== "service")
    lines.push(`Tip zahteva: ${commerce.intent}`);
  if (commerce.tier)
    lines.push(
      `Plan: ${commerce.tier === "signature" ? "Casa Signature" : commerce.tier === "private" ? "Casa Private" : "Casa poseta"}`,
    );
  if (commerce.plan_change)
    lines.push(`Promena ritma: ${commerce.plan_change}`);
  if (commerce.booked_for === "assistant")
    lines.push("Zahtev šalje osoba koja organizuje domaćinstvo.");
  return lines.join("\n");
}
export const eventNames = [
  "page_view",
  "lead_start",
  "addon_select",
  "collection_select",
  "plan_select",
  "whatsapp_open",
] as const;
export const eventSchema = z
  .object({
    event_id: z.string().uuid(),
    session_id: z.string().uuid(),
    event_name: z.enum(eventNames),
    context: z
      .string()
      .regex(
        /^(home|catalog|plans|consultation|collection:(filmsko-vece|povratak-kuci|gosti-stizu|nova-sezona|useljenje)|tier:(once|signature|private)|upgrade:(hidden-cables|all-bedrooms|seasonal-wardrobe)|service:[0-9a-f-]{36})$/,
      )
      .max(80),
  })
  .strict();
