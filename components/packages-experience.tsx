"use client";
import { useState } from "react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import {
  casaPlans,
  frequencies,
  type PackageSelection,
  type PlanId,
} from "@/lib/packages";
import {
  isIndividualService,
  packageServiceId,
  serviceCategories,
  serviceCategory,
  type Service,
} from "@/lib/catalog";
import { useTranslation } from "./locale-provider";
import Link from "./localized-link";
import { track } from "@/lib/analytics-client";
import { RequestForm } from "./request-form";

export function PackagesExperience({
  services,
  ready,
}: {
  services: Service[];
  ready: boolean;
}) {
  const t = useTranslation();
  const [planId, setPlanId] = useState<PlanId>("custom");
  const [items, setItems] = useState<PackageSelection["items"]>([]);
  const [submitting, setSubmitting] = useState(false);
  const packageService = services.find(
    (service) => service.id === packageServiceId,
  );
  const choices = services.filter(isIndividualService);
  const plan = casaPlans.find((plan) => plan.id === planId)!;
  const defaultFrequency =
    planId === "weekly"
      ? "weekly"
      : planId === "monthly"
        ? "twice-monthly"
        : "once";
  function choosePlan(id: PlanId) {
    setPlanId(id);
    track(
      "plan_select",
      `tier:${id === "weekly" ? "private" : id === "monthly" ? "signature" : "once"}`,
    );
    setItems((previous) =>
      previous.map((item) => ({
        ...item,
        frequency:
          id === "weekly"
            ? "weekly"
            : id === "monthly"
              ? "twice-monthly"
              : "once",
      })),
    );
    document
      .getElementById("moj-paket")
      ?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <>
      <div className="plans-grid">
        {casaPlans
          .filter((entry) => ["once", "monthly", "weekly"].includes(entry.id))
          .map((entry, index) => (
            <article
              className={`plan-card ${entry.id === "custom" ? "plan-card-custom" : ""}`}
              key={entry.id}
            >
              <span className="eyebrow">
                {String(index + 1).padStart(2, "0")} / CASA
              </span>
              <h2>{t(entry.name)}</h2>
              <p className="plan-rhythm">{t(entry.rhythm)}</p>
              <p>{t(entry.description)}</p>
              <span className="plan-price">{t("Cena prema vašem izboru")}</span>
              <button
                className="button button-dark"
                disabled={submitting}
                onClick={() => choosePlan(entry.id)}
              >
                {t("Sastavite ovaj plan")}
                <ArrowUpRight size={16} />
              </button>
            </article>
          ))}
      </div>
      <section className="concierge-prompt">
        <h2>{t("Neka naš tim sastavi plan za vas.")}</h2>
        <p>
          {t(
            "Podelite svoje želje. Mi predlažemo usluge i ritam, uz jednu preglednu ponudu.",
          )}
        </p>
        <Link
          className="button button-dark"
          href="/konsultacije?tier=signature"
        >
          {t("Prepustite nam brigu o domu")}
        </Link>
        <Link className="text-link" href="/konsultacije?tier=private">
          {t("Razgovarajte o Casa Private")}
        </Link>
      </section>
      <section className="premium-standard">
        <Sparkles size={24} strokeWidth={1.3} />
        <div>
          <h2>{t("Ista pažnja. Vaš ritam.")}</h2>
          <p>
            {t(
              "Svaki Casa plan uključuje jasan dogovor, pažljiv rad i uredan prostor nakon posete. Broj dolazaka i obim usluga prilagođavamo vama.",
            )}
          </p>
        </div>
      </section>
      <section id="moj-paket" className="package-builder">
        <div className="package-heading">
          <span className="eyebrow">{t("BRIGA PO VAŠOJ MERI")}</span>
          <h2>{t("Sastavite svoju Casa.")}</h2>
          <p>
            {t(
              "Izaberite usluge i učestalost. Obim posla, dostupnost i konačnu cenu potvrđujemo zajedno.",
            )}
          </p>
        </div>
        <div className="builder-grid">
          <div className="package-choices">
            <label className="plan-select">
              {t("Vaš plan")}
              <select
                disabled={submitting}
                value={planId}
                onChange={(event) => choosePlan(event.target.value as PlanId)}
              >
                {casaPlans.map((entry) => (
                  <option value={entry.id} key={entry.id}>
                    {t(entry.name)}
                  </option>
                ))}
              </select>
            </label>
            {items.length > 0 && (
              <a className="package-review-link" href="#pregled-paketa">
                {t("Vaš izbor")} · {items.length}
                <ArrowUpRight size={16} />
              </a>
            )}
            {serviceCategories.map((category) => (
              <fieldset
                disabled={submitting}
                key={category.id}
                className="package-category"
              >
                <legend>{t(category.title)}</legend>
                {choices
                  .filter((service) => serviceCategory(service) === category.id)
                  .map((service) => {
                    const selected = items.some(
                      (item) => item.service_id === service.id,
                    );
                    return (
                      <label
                        className={`package-choice ${selected ? "is-selected" : ""}`}
                        key={service.id}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={!selected && items.length >= 12}
                          onChange={() =>
                            setItems((previous) =>
                              selected
                                ? previous.filter(
                                    (item) => item.service_id !== service.id,
                                  )
                                : [
                                    ...previous,
                                    {
                                      service_id: service.id,
                                      frequency: defaultFrequency,
                                    },
                                  ],
                            )
                          }
                        />
                        <span>
                          {t(service.name)}
                          <small>{t(service.tagline)}</small>
                        </span>
                        <Check
                          className="choice-check"
                          size={18}
                          aria-hidden="true"
                        />
                      </label>
                    );
                  })}
              </fieldset>
            ))}
            {items.length >= 12 && (
              <p className="fine-print" role="status">
                {t(
                  "Do 12 usluga u jednom zahtevu. Dodatne zadatke navedite u napomeni.",
                )}
              </p>
            )}
          </div>
          <aside
            id="pregled-paketa"
            className="package-summary"
            aria-label={t("Vaš izbor")}
          >
            <span className="eyebrow">{t("VAŠ LIČNI PLAN")}</span>
            <h3>{t(plan.name)}</h3>
            {items.length === 0 ? (
              <p className="package-empty">
                {t("Dodajte prvu uslugu da započnete svoj plan.")}
              </p>
            ) : (
              <>
                <div className="selected-services">
                  {items.map((item) => {
                    const service = choices.find(
                      (service) => service.id === item.service_id,
                    )!;
                    return (
                      <label key={item.service_id}>
                        <span>{t(service.name)}</span>
                        <select
                          disabled={submitting}
                          aria-label={`${t("Učestalost")}: ${t(service.name)}`}
                          value={item.frequency}
                          onChange={(event) => {
                            setPlanId("custom");
                            setItems((previous) =>
                              previous.map((current) =>
                                current.service_id === item.service_id
                                  ? {
                                      ...current,
                                      frequency: event.target
                                        .value as typeof item.frequency,
                                    }
                                  : current,
                              ),
                            );
                          }}
                        >
                          {frequencies.map((frequency) => (
                            <option key={frequency.id} value={frequency.id}>
                              {t(frequency.label)}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
                <p className="package-billing">
                  {t(
                    "Dobijate jednu preglednu ponudu. Materijal, kupljeni proizvodi i dodatni rad navode se odvojeno. Slanje zahteva ne pokreće naplatu niti automatsku pretplatu.",
                  )}
                </p>
                {packageService ? (
                  <RequestForm
                    service={packageService}
                    ready={ready}
                    onBusyChange={setSubmitting}
                    packageSelection={{ plan_id: planId, items }}
                    formId="zahtev-za-paket"
                  />
                ) : (
                  <p className="notice">
                    {t(
                      "Prijem zahteva za pakete otvaramo nakon aktiviranja ponude.",
                    )}
                  </p>
                )}
              </>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
