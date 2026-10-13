"use client";
import { washingExtras, type WashingExtra } from "@/lib/club";
import { ClubPrice } from "./club-price";
import { useLocale, useTranslation } from "./locale-provider";
import { track } from "@/lib/analytics-client";
export function WashingExtras({
  selected,
  onChange,
  context,
  limit,
}: {
  selected: WashingExtra[];
  onChange: (value: WashingExtra[]) => void;
  context: string;
  limit: number;
}) {
  const t = useTranslation();
  const locale = useLocale();
  return (
    <details className="visit-extras">
      <summary>{t("Pranje nameštaja i dušeka uz tepihe")}</summary>
      <p>
        {t(
          "Izaberite do dve dodatne usluge. Količinu, termin i konačnu cenu potvrđujemo u ponudi.",
        )}
      </p>
      {washingExtras.map((item) => {
        const selection = selected.find((value) => value.key === item.key);
        return (
          <div key={item.key}>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={Boolean(selection)}
                disabled={!selection && selected.length >= limit}
                onChange={(event) => {
                  onChange(
                    event.target.checked
                      ? [...selected, { key: item.key, count: 1 }]
                      : selected.filter((value) => value.key !== item.key),
                  );
                  if (event.target.checked) track("addon_select", context);
                }}
              />
              <span>
                {t(item.name)}
                <ClubPrice
                  price={item.price}
                  unit={item.unit}
                  locale={locale}
                  t={t}
                />
              </span>
            </label>
            {selection && (
              <label>
                {t("Količina")}
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  required
                  value={selection.count}
                  onChange={(event) =>
                    onChange(
                      selected.map((value) =>
                        value.key === item.key
                          ? { ...value, count: Number(event.target.value) }
                          : value,
                      ),
                    )
                  }
                />
              </label>
            )}
          </div>
        );
      })}
    </details>
  );
}
