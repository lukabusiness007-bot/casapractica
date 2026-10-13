"use client";
import { useState } from "react";
import { ClubPrice } from "./club-price";
import { useLocale, useTranslation } from "./locale-provider";
import { washingEstimate, type WashingSelection } from "@/lib/club";
export function WashingEstimate({
  onChange,
  id,
}: {
  onChange: (value: WashingSelection | undefined) => void;
  id: string;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const [area, setArea] = useState("");
  const [method, setMethod] = useState<WashingSelection["method"]>("wet");
  const [transport, setTransport] = useState(true);
  function update(
    nextArea: string,
    nextMethod: WashingSelection["method"],
    nextTransport: boolean,
  ) {
    const value = Number(nextArea);
    onChange(
      value > 0 && value <= 1000
        ? { area: value, method: nextMethod, transport: nextTransport }
        : undefined,
    );
  }
  const valid = Number(area) > 0 && Number(area) <= 1000;
  return (
    <div className="washing-estimate">
      <h3>{t("Izračunajte okvirnu cenu")}</h3>
      <div className="form-row">
        <label htmlFor={`${id}-area`}>
          {t("Površina tepiha (m²)")}
          <input
            id={`${id}-area`}
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            value={area}
            placeholder="8"
            onChange={(event) => {
              setArea(event.target.value);
              update(event.target.value, method, transport);
            }}
          />
        </label>
        <label htmlFor={`${id}-method`}>
          {t("Vrsta pranja")}
          <select
            id={`${id}-method`}
            value={method}
            onChange={(event) => {
              const next = event.target.value as WashingSelection["method"];
              setMethod(next);
              update(area, next, transport);
            }}
          >
            <option value="wet">{t("Dubinsko, mokro pranje")}</option>
            <option value="semi-dry">
              {t("Polusuvo pranje bez ispiranja")}
            </option>
          </select>
        </label>
      </div>
      <p className="fine-print">
        {t(
          "Polusuvo pranje je za persijske, svilene i viskozne tepihe. Vrstu pranja potvrđujemo prema materijalu.",
        )}
      </p>
      <label className="inline-check">
        <input
          type="checkbox"
          checked={transport}
          onChange={(event) => {
            setTransport(event.target.checked);
            update(area, method, event.target.checked);
          }}
        />
        <span>
          {t("Odvoz i dovoz tepiha")} ·{" "}
          {t("1.000 RSD, posebno iskazan transport")}
        </span>
      </label>
      {valid && (
        <div className="washing-estimate-result" aria-live="polite">
          <ClubPrice
            price={washingEstimate({ area: Number(area), method, transport })}
            locale={locale}
            t={t}
          />
          <small>
            {t(
              "Procena uključuje izabrano pranje i transport ako je označen. Dodatne usluge dogovaramo posebno.",
            )}
          </small>
        </div>
      )}
    </div>
  );
}
