import { z } from "zod";

export const propertyTypes = {
  apartment: "Stan",
  house: "Kuća",
  building: "Stambena zgrada",
  business: "Poslovni prostor",
} as const;
export const pestTypes = {
  unknown: "Nisam siguran/a",
  rodents: "Miševi ili pacovi",
  cockroaches: "Bubašvabe",
  ants: "Mravi",
  fleas: "Buve",
  bedbugs: "Stenice",
  wasps: "Ose ili stršljeni",
  mould: "Buđ ili neprijatan miris",
  prevention: "Dezinfekcija ili preventivni pregled",
} as const;
export const protectionPlans = {
  assessment: "Po proceni specijaliste",
  home: "Zaštita doma",
  building: "Zaštita zgrade",
  business: "Zaštita poslovnog prostora",
} as const;

export const pestAssessmentSchema = z.object({
  property_type: z.enum(["apartment", "house", "building", "business"]),
  area: z.number().finite().positive().max(100000).optional(),
  pest: z.enum(["unknown", "rodents", "cockroaches", "ants", "fleas", "bedbugs", "wasps", "mould", "prevention"]),
  affected: z.string().trim().max(500).default(""),
  previous: z.string().trim().max(500).default(""),
  children: z.boolean(),
  pets: z.boolean(),
  plan: z.enum(["assessment", "home", "building", "business"]).default("assessment"),
}).strict();
export type PestAssessment = z.infer<typeof pestAssessmentSchema>;

export function pestAssessmentFromForm(form: FormData) {
  const area = form.get("pest_area");
  return {
    property_type: form.get("pest_property"),
    ...(area ? { area: Number(area) } : {}),
    pest: form.get("pest_type"),
    affected: form.get("pest_affected") || "",
    previous: form.get("pest_previous") || "",
    children: form.has("pest_children"),
    pets: form.has("pest_pets"),
    plan: form.get("pest_plan") || "assessment",
  };
}

// Build the administration summary from validated enums, never client labels.
export function pestAssessmentNote(input: PestAssessment) {
  return [
    `DDD procena: ${propertyTypes[input.property_type]}; površina: ${input.area === undefined ? "nije navedena" : `${input.area} m²`}.`,
    `Problem: ${pestTypes[input.pest]}. Plan: ${protectionPlans[input.plan]}.`,
    ...(input.affected ? [`Zahvaćeni delovi i trajanje: ${input.affected}`] : []),
    ...(input.previous ? [`Prethodni tretmani: ${input.previous}`] : []),
    `Deca: ${input.children ? "da" : "ne"}; kućni ljubimci: ${input.pets ? "da" : "ne"}.`,
    "Obim, priprema, termin, cena i kontrolne posete potvrđuju se nakon procene.",
  ].join("\n");
}
