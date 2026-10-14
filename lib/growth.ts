import { attributionSchema } from "./attribution";
import { washingEstimate, washingExtras } from "./club";
import { z } from "zod";
import { findSubscription } from "./subscriptions";
import type { Service } from "./catalog";
import { isPestService } from "./pest-services";
import { pestAssessmentSchema, pestAssessmentNote } from "./pest-assessment";

export const collections = [
  {
    id: "filmsko-vece",
    name: "Filmsko veče, spremno",
    description: "Televizor, povezivanje zvuka i polica za vaš omiljeni kutak.",
    image: "/images/services/ugradnja-tv-a.webp",
    slugs: ["ugradnja-tv-a", "podesavanje-tv-a", "montaza-polica"],
  },
  {
    id: "povratak-kuci",
    name: "Povratak kući",
    description: "Čist dom i osveženi tepisi za vaš povratak.",
    image: "/images/services/ciscenje-doma.webp",
    slugs: ["ciscenje-doma", "pranje-tepiha"],
  },
  {
    id: "gosti-stizu",
    name: "Gosti stižu",
    description: "Čišćenje doma i pranje tepiha pre dolaska gostiju.",
    image: "/images/services/pranje-tepiha.webp",
    slugs: ["ciscenje-doma", "pranje-tepiha"],
  },
  {
    id: "nova-sezona",
    name: "Nova sezona",
    description:
      "Servis klime, dostupni filteri i svežina doma za novu sezonu.",
    image: "/images/services/servis-klime.webp",
    slugs: ["servis-klime", "odrzavanje-filtera", "ciscenje-doma"],
  },
  {
    id: "useljenje",
    name: "Useljenje sa lakoćom",
    description:
      "Čišćenje, sklapanje nameštaja i postavljanje slika nakon useljenja.",
    image: "/images/services/sklapanje-namestaja.webp",
    slugs: ["ciscenje-doma", "sklapanje-namestaja", "kacenje-slika-i-ogledala"],
  },
    {
    "id": "zastita-doma",
    "name": "Zaštita doma",
    "description": "DDD procena za stan ili kuću, uz izbor potrebnih tretmana. Obim, kontrolu i cenu dogovaramo nakon pregleda.",
    "image": "/images/services/ddd-zastita.webp",
    "slugs": [
      "preventivna-ddd-zastita"
    ]
  },
  {
    "id": "zastita-zgrade",
    "name": "Zaštita zgrade",
    "description": "Preventivni DDD plan za zajedničke delove zgrade, podrume i druge dogovorene površine. Raspored i tretmane potvrđujemo prema proceni objekta.",
    "image": "/images/services/ddd-zastita.webp",
    "slugs": [
      "preventivna-ddd-zastita"
    ]
  },
  {
    "id": "zastita-poslovnog-prostora",
    "name": "Zaštita poslovnog prostora",
    "description": "DDD procena i plan za poslovne prostore, usklađen sa namenom i radnim vremenom objekta. Preglede, tretmane i kontrolne posete dogovaramo pojedinačno.",
    "image": "/images/services/ddd-zastita.webp",
    "slugs": [
      "preventivna-ddd-zastita"
    ]
  }
] as const;
export const upgrades = [
  {
    id: "hidden-cables",
    slug: "ugradnja-tv-a",
    name: "Skrivanje kablova u zidu",
    description:
      "Dodatni rad nakon provere zida; obim i doplatu potvrđujete pre dolaska.",
  },
] as const;
const related: Record<string, string[]> = {
  "ugradnja-tv-a": ["podesavanje-tv-a", "montaza-polica"],
  "podesavanje-tv-a": ["ugradnja-tv-a", "podesavanje-wifi-mreze"],
  "servis-klime": ["ciscenje-doma"],
  "sklapanje-namestaja": ["kacenje-slika-i-ogledala", "montaza-polica"],
  "ciscenje-doma": ["pranje-tepiha", "iznosenje-smeca"],
  krecenje: ["ciscenje-doma", "iznosenje-smeca"],
  "iznosenje-smeca": ["ciscenje-doma", "krecenje"],
  "pranje-tepiha": ["ciscenje-doma"],
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
    pest_assessment: pestAssessmentSchema.optional(),
    washing: z
      .object({
        area: z.number().positive().max(1000),
        method: z.enum(["wet", "semi-dry"]),
        transport: z.boolean(),
      })
      .strict()
      .optional(),
    washing_extras: z
      .array(
        z
          .object({
            key: z.enum(["upholstery", "single-mattress", "double-mattress"]),
            count: z.number().int().min(1).max(100),
          })
          .strict(),
      )
      .max(2)
      .refine(
        (items) => new Set(items.map((item) => item.key)).size === items.length,
      )
      .optional(),
    service_scope: z.enum(["full", "priority", "single-room"]).optional(),
    cadence: z.enum(["once", "weekly", "fortnightly", "monthly"]).optional(),
    intent: z
      .enum(["service", "visit", "managed", "plan-change"])
      .default("service"),
    subscription_id: z
      .enum(["garderoba", "ritam", "na-cuvanju", "family"])
      .optional(),
    tier: z.enum(["once", "signature", "private"]).optional(),
    plan_frequency: z
      .enum(["monthly", "twice-monthly", "weekly", "mixed"])
      .optional(),
    collection_id: z
      .enum([
        "filmsko-vece",
        "povratak-kuci",
        "gosti-stizu",
        "nova-sezona",
        "useljenje",
        "zastita-doma",
        "zastita-zgrade",
        "zastita-poslovnog-prostora",
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
    if (
      value.additional_service_ids.length +
        (value.washing_extras?.length || 0) >
      2
    )
      context.addIssue({
        code: "custom",
        message: "Izaberite najviše dve dodatne usluge.",
      });
    if (
      value.subscription_id &&
      !findSubscription(value.subscription_id, value.intent === "plan-change")
    )
      context.addIssue({ code: "custom", message: "Proverite izbor plana." });
    if (
      value.subscription_id &&
      (value.tier || !["managed", "plan-change"].includes(value.intent))
    )
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
  if (commerce.pest_assessment) {
    if (!isPestService(primary.slug) && !(primary.slug === "moja-casa" && commerce.collection_id?.startsWith("zastita-")))
      throw new Error("Proverite izbor obima.");
    lines.push(pestAssessmentNote(commerce.pest_assessment));
  }
  if (commerce.washing_extras?.length) {
    if (primary.slug !== "pranje-tepiha")
      throw new Error("Proverite izbor pranja.");
    for (const selection of commerce.washing_extras) {
      const extra = washingExtras.find((item) => item.key === selection.key)!;
      lines.push(
        `Dodatna usluga: ${extra.name}; količina: ${selection.count}; okvirna redovna cena: ${(extra.price! * selection.count) / 100} RSD. Konačan obim potvrđuje tim.`,
      );
    }
  }
  if (commerce.washing) {
    if (primary.slug !== "pranje-tepiha")
      throw new Error("Proverite izbor pranja.");
    lines.push(
      `Pranje: ${commerce.washing.method === "wet" ? "dubinsko, mokro" : "polusuvo"}; površina: ${commerce.washing.area} m²; transport: ${commerce.washing.transport ? "da" : "ne"}.`,
    );
    lines.push(
      `Okvirna redovna cena iz cenovnika: ${washingEstimate(commerce.washing) / 100} RSD. Obim i cenu potvrđuje tim.`,
    );
  }
  if (commerce.service_scope) {
    if (
      !["ciscenje-doma", "krecenje"].includes(primary.slug) ||
      (primary.slug === "ciscenje-doma" &&
        commerce.service_scope === "single-room")
    )
      throw new Error("Proverite izbor obima.");
    lines.push(
      `Željeni obim: ${commerce.service_scope === "full" ? "pun obim" : commerce.service_scope === "single-room" ? "jedna soba" : primary.slug === "ciscenje-doma" ? "kuhinja i kupatilo" : "odabrani zidovi"}.`,
    );
  }
  if (commerce.cadence) {
    if (primary.slug !== "ciscenje-doma")
      throw new Error("Proverite ritam dolazaka.");
    lines.push(
      `Ritam čišćenja: ${commerce.cadence === "weekly" ? "svake nedelje" : commerce.cadence === "fortnightly" ? "na dve nedelje" : commerce.cadence === "monthly" ? "jednom mesečno" : "jednokratno"}. Termin i cena potvrđuju se sa timom.`,
    );
  }
  if (commerce.subscription_id) {
    if (primary.slug !== "moja-casa") throw new Error("Proverite izbor plana.");
    const subscription = findSubscription(
      commerce.subscription_id,
      commerce.intent === "plan-change",
    );
    if (!subscription) throw new Error("Proverite izbor plana.");
    lines.push(`Mesečni paket: ${subscription.name}`);
    lines.push(
      `Informativna mesečna cena: ${(subscription.price / 100).toFixed(2)} RSD`,
    );
    lines.push(...subscription.includes.map((item) => `• ${item}`));
    lines.push(`Posebno: ${subscription.excludes}`);
    lines.push(
      "Početak i naplata nakon potvrde ponude; ovaj zahtev ne aktivira automatsku pretplatu.",
    );
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
  "lead_submit",
  "club_popup_view",
  "club_cta_click",
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
    attribution: attributionSchema.optional(),
    context: z
      .string()
      .regex(
        /^(home|catalog|plans|consultation|contact|about|guides|guide:(cena-redovnog-ciscenja|nedeljno-ili-dvonedeljno-ciscenje|redovno-i-generalno-ciscenje|mesecni-plan-odrzavanja)|collection:(filmsko-vece|povratak-kuci|gosti-stizu|nova-sezona|useljenje)|tier:(once|signature|private)|upgrade:(hidden-cables|all-bedrooms|seasonal-wardrobe)|service:[0-9a-f-]{36})$/,
      )
      .max(80),
  })
  .strict();
