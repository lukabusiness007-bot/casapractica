import { money } from "@/lib/catalog";
import { clubPrice } from "@/lib/club";
import type { Locale } from "@/lib/i18n/routing";
import type { Translator } from "@/lib/i18n";

export function ClubPrice({
  price,
  quoteLabel = "Cena na upit",
  maxPrice,
  unit,
  from = false,
  locale,
  t,
}: {
  price: number | null;
  quoteLabel?: string;
  maxPrice?: number;
  unit?: string;
  from?: boolean;
  locale: Locale;
  t: Translator;
}) {
  const format = (amount: number, max?: number) =>
    max
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "RSD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).formatRange(amount / 100, max / 100)
      : money(amount, locale);
  if (price === null)
    return (
      <span className="club-price-on-request">
        {t(quoteLabel)}
        <small>{t("Članovi kluba: 5% popusta na dogovorenu cenu")}</small>
      </span>
    );
  return (
    <span className="club-price-pair">
      <span className="regular-price">
        <small>{t("Redovna cena")}</small>
        <strong>
          {from && locale !== "zh" && `${t("Od")} `}
          {format(price, maxPrice)}
          {from && locale === "zh" && t("Od")}
        </strong>
        {unit && <small>{t(unit)}</small>}
      </span>
      <span className="member-price">
        <small>{t("Klupska cena · −5%")}</small>
        <strong>
          {from && locale !== "zh" && `${t("Od")} `}
          {format(clubPrice(price), maxPrice ? clubPrice(maxPrice) : undefined)}
          {from && locale === "zh" && t("Od")}
        </strong>
        {unit && <small>{t(unit)}</small>}
      </span>
    </span>
  );
}
