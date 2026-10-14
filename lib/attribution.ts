import { z } from "zod";
import { services } from "./catalog";
import { isPublishedService } from "./service-availability";
import { splitLocale, locales } from "./i18n/routing";
import { guideSlugs } from "./guide-routing";

const publicPaths = new Set([
  "/",
  "/usluge",
  "/ddd",
  "/paketi",
  "/konsultacije",
  "/klub",
  "/kolekcije",
  "/kontakt",
  "/o-nama",
  "/saveti",
  ...[
    "filmsko-vece",
    "povratak-kuci",
    "gosti-stizu",
    "nova-sezona",
    "useljenje",
    "zastita-doma",
    "zastita-zgrade",
    "zastita-poslovnog-prostora",
  ].map((id) => `/kolekcije/${id}`),
  ...services
    .filter(isPublishedService)
    .map((service) => `/usluge/${service.slug}`),
  ...guideSlugs.map((slug) => `/saveti/${slug}`),
]);
export function publicLandingPath(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return publicPaths.has(splitLocale(path).path) ? path : "/";
}
export const attributionSchema = z
  .object({
    source: z.enum([
      "direct",
      "google",
      "bing",
      "yandex",
      "social",
      "referral",
      "other",
    ]),
    medium: z.enum([
      "direct",
      "organic",
      "paid",
      "social",
      "referral",
      "other",
    ]),
    landing_path: z
      .string()
      .max(200)
      .refine((path) => path === publicLandingPath(path)),
    locale: z.enum(locales),
  })
  .strict();
export type Attribution = z.infer<typeof attributionSchema>;

// Retain only predefined source groups and public paths, never raw queries,
// campaign values, referrer URLs, contact information or private account paths.
export function classifyAttribution(
  href: string,
  referrer: string,
): Attribution {
  const url = new URL(href);
  const paid =
    /^(cpc|ppc|paid|paidsearch|paid-social|paid_social|display)$/i.test(
      url.searchParams.get("utm_medium") || "",
    ) || ["gclid", "msclkid", "yclid"].some((key) => url.searchParams.has(key));
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {}
  const campaign = (url.searchParams.get("utm_source") || "").toLowerCase();
  let source: Attribution["source"] = "direct";
  if (campaign) {
    source = ["google", "bing", "yandex"].includes(campaign)
      ? (campaign as "google" | "bing" | "yandex")
      : /^(facebook|instagram|tiktok|linkedin|social)$/.test(campaign)
        ? "social"
        : "other";
  } else if (url.searchParams.has("gclid")) source = "google";
  else if (url.searchParams.has("msclkid")) source = "bing";
  else if (url.searchParams.has("yclid")) source = "yandex";
  else if (
    /(^|\.)google\.(com|rs|ru|de|com\.tr|co\.uk|fr|it|es|at|ch|co\.in|com\.au|ca)$/.test(
      host,
    )
  )
    source = "google";
  else if (/(^|\.)bing\.com$/.test(host)) source = "bing";
  else if (/(^|\.)yandex\.(com|ru|com\.tr)$/.test(host)) source = "yandex";
  else if (/(^|\.)(facebook|instagram|tiktok|linkedin)\.com$/.test(host))
    source = "social";
  else if (
    host &&
    host !== url.hostname &&
    host !== url.hostname.replace(/^www\./, "") &&
    `www.${host}` !== url.hostname
  )
    source = "referral";
  if (paid && source === "direct") source = "other";
  const campaignMedium = (
    url.searchParams.get("utm_medium") || ""
  ).toLowerCase();
  const specifiedMedium = ["organic", "social", "referral", "direct"].includes(
    campaignMedium,
  )
    ? (campaignMedium as Attribution["medium"])
    : campaignMedium
      ? "other"
      : undefined;
  const medium: Attribution["medium"] = paid
    ? "paid"
    : specifiedMedium
      ? specifiedMedium
      : campaign && source !== "social"
        ? "other"
        : ["google", "bing", "yandex"].includes(source)
          ? "organic"
          : source === "social"
            ? "social"
            : source === "referral"
              ? "referral"
              : source === "direct"
                ? "direct"
                : "other";
  return {
    source,
    medium,
    landing_path: publicLandingPath(url.pathname),
    locale: splitLocale(url.pathname).locale,
  };
}

export function sourceReport(
  requests: {
    attribution?: unknown;
    status?: string;
    commerce?: unknown;
    analytics_session_id?: unknown;
  }[],
) {
  const rows = new Map<
    string,
    {
      source: string;
      medium: string;
      leads: number;
      regular: number;
      confirmed: number;
    }
  >();
  for (const request of requests) {
    const parsed = attributionSchema.safeParse(request.attribution);
    if (!parsed.success || !request.analytics_session_id) continue;
    const { source, medium } = parsed.data;
    const key = `${source}/${medium}`;
    const row = rows.get(key) || {
      source,
      medium,
      leads: 0,
      regular: 0,
      confirmed: 0,
    };
    const commerce = request.commerce as
      | {
          intent?: string;
          cadence?: string;
          tier?: string;
          plan_frequency?: string;
        }
      | undefined;
    const regular =
      Boolean(commerce?.plan_frequency) ||
      commerce?.intent === "managed" ||
      ["signature", "private"].includes(commerce?.tier || "") ||
      ["weekly", "fortnightly", "monthly"].includes(commerce?.cadence || "");
    row.leads++;
    if (regular) {
      row.regular++;
      if (["scheduled", "completed"].includes(request.status || ""))
        row.confirmed++;
    }
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => b.leads - a.leads);
}
