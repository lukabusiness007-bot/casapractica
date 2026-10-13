import { z } from "zod";
import { isRetiredServiceId, packageServiceId, type Service } from "./catalog";

export const casaPlans = [
  {
    id: "once",
    name: "Casa poseta",
    rhythm: "Jedna pažljivo planirana poseta.",
    description:
      "Čišćenje, montaža, popravke ili više zadataka u jednom dolasku.",
  },
  {
    id: "monthly",
    name: "Casa Signature",
    rhythm: "Dve posete mesečno.",
    description:
      "Redovno čišćenje i održavanje doma, u ritmu koji vam odgovara.",
  },
  {
    id: "weekly",
    name: "Casa Private",
    rhythm: "Jedna poseta svake nedelje.",
    description:
      "Čišćenje i održavanje jedne ili više nekretnina u dogovorenom obimu.",
  },
  {
    id: "maintenance",
    name: "Casa održavanje",
    rhythm: "Plan održavanja po dogovoru.",
    description:
      "Sitne popravke, montaže i sezonsko održavanje uz odgovarajući stručni tim.",
  },
  {
    id: "custom",
    name: "Moja Casa",
    rhythm: "Vaše usluge. Vaš ritam.",
    description:
      "Kombinujte čišćenje, majstorske poslove i tehnologiju u jednom ličnom planu.",
  },
] as const;
export type PlanId = (typeof casaPlans)[number]["id"];
export const frequencies = [
  { id: "once", label: "Jednokratno" },
  { id: "monthly", label: "Jednom mesečno" },
  { id: "twice-monthly", label: "Dva puta mesečno" },
  { id: "weekly", label: "Svake nedelje" },
  { id: "absence", label: "Tokom odsustva" },
] as const;
export const packageSchema = z
  .object({
    plan_id: z.enum(["once", "monthly", "weekly", "maintenance", "custom"]),
    items: z
      .array(
        z
          .object({
            service_id: z
              .string()
              .uuid()
              .refine((id) => id !== packageServiceId && !isRetiredServiceId(id)),
            frequency: z.enum([
              "once",
              "monthly",
              "twice-monthly",
              "weekly",
              "absence",
            ]),
          })
          .strict(),
      )
      .min(1)
      .max(12)
      .refine(
        (items) =>
          new Set(items.map((item) => item.service_id)).size === items.length,
      ),
  })
  .strict();
export type PackageSelection = z.infer<typeof packageSchema>;

// Persist a server-built summary in the existing request note. Client prices and
// service names are never accepted; administration and account history use this.
export function packageRequestNote(
  selection: PackageSelection,
  available: Pick<Service, "id" | "name">[],
  note: string,
) {
  const plan = casaPlans.find((plan) => plan.id === selection.plan_id);
  if (!plan) throw new Error("Proverite izbor usluga u paketu.");
  const lines = selection.items.map((item) => {
    const service = available.find((service) => service.id === item.service_id);
    const frequency = frequencies.find(
      (frequency) => frequency.id === item.frequency,
    );
    if (!service || service.id === packageServiceId || isRetiredServiceId(service.id) || !frequency)
      throw new Error("Proverite izbor usluga u paketu.");
    return `• ${service.name} — ${frequency.label}`;
  });
  return [
    `Casa plan: ${plan.name}`,
    ...lines,
    ...(note ? ["", note] : []),
  ].join("\n");
}
