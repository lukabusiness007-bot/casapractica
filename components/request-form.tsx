"use client";
import { BusinessContact } from "./business-contact";
import { analyticsAttribution } from "@/lib/analytics-client";
import { useLocale, useTranslation } from "@/components/locale-provider";
import Link from "./localized-link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import type { Service } from "@/lib/catalog";
import type { PackageSelection } from "@/lib/packages";
import { upgrades, type CommerceInput } from "@/lib/growth";
import { analyticsSession, track } from "@/lib/analytics-client";
import { ClubPrice } from "./club-price";
import { servicePricing } from "@/lib/service-pricing";
import { WashingEstimate } from "./washing-estimate";
import type { WashingSelection, WashingExtra } from "@/lib/club";
import { WashingExtras } from "./washing-extras";
import { isPestService } from "@/lib/pest-services";
import { pestAssessmentFromForm } from "@/lib/pest-assessment";
import { PestAssessmentFields } from "./pest-assessment-fields";
import { homeServiceDetails } from "@/lib/home-service-additions";
export function RequestForm({
  service,
  ready,
  packageSelection,
  formId = "zahtev",
  onBusyChange,
  commerce = {},
  recommendations = [],
}: {
  service: Service;
  ready: boolean;
  packageSelection?: PackageSelection;
  formId?: string;
  onBusyChange?: (busy: boolean) => void;
  commerce?: CommerceInput;
  recommendations?: Service[];
}) {
  const t = useTranslation();
  const locale = useLocale();
  const pestRequest = isPestService(service.slug) || !!commerce.collection_id?.startsWith("zastita-");
  const serviceHint = homeServiceDetails[service.slug]?.requestHint;
  const leadStarted = useRef(false);
  const [washing, setWashing] = useState<WashingSelection>();
  const [washingExtras, setWashingExtras] = useState<WashingExtra[]>([]);
  const [scope, setScope] = useState("full");
  const [cadence, setCadence] = useState("once");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [additional, setAdditional] = useState<string[]>([]);
  const [upgradeIds, setUpgradeIds] = useState<
    (typeof upgrades)[number]["id"][]
  >([]);
  const [result, setResult] = useState<{
    reference: string;
    whatsapp: string | null;
  } | null>(null);
  const selectionKey = JSON.stringify([service.id, packageSelection, commerce]);
  useEffect(() => {
    setAdditional([]);
    setUpgradeIds([]);
    setWashing(undefined);
    setWashingExtras([]);
    setScope("full");
    setCadence("once");
    leadStarted.current = false;
  }, [service.id]);
  const context =
    commerce.intent && commerce.intent !== "service"
      ? "consultation"
      : `service:${service.id}`;
  useEffect(() => {
    setResult(null);
    setError("");
  }, [selectionKey]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/zahtevi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          service_id: service.id,
          ...(packageSelection ? { package: packageSelection } : {}),
          commerce: {
            ...commerce,
            ...(pestRequest ? { pest_assessment: pestAssessmentFromForm(formData) } : {}),
            ...(washing ? { washing } : {}),
            ...(washingExtras.length ? { washing_extras: washingExtras } : {}),
            ...(["ciscenje-doma", "krecenje"].includes(service.slug)
              ? { service_scope: scope }
              : {}),
            ...(service.slug === "ciscenje-doma" ? { cadence } : {}),
            additional_service_ids: additional,
            upgrade_ids: upgradeIds,
            booked_for: formData.has("assistant") ? "assistant" : "self",
            contact_preference: formData.get("contact_preference") || "phone",
            follow_up_opt_in: formData.has("follow_up"),
          },
          analytics_session_id: analyticsSession(),
          attribution: analyticsAttribution(),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw Error(body.error);
      setResult(body);
      track("lead_submit", context);
    } catch (error) {
      setError(
        error instanceof Error ? t(error.message) : t("Pokušajte ponovo."),
      );
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  if (result)
    return (
      <div className="success-panel" role="status">
        <Check size={24} />
        <h3>{t("Zahtev je sačuvan.")}</h3>
        <p>
          {t("Vaš broj zahteva:")} <strong>{result.reference}</strong>
        </p>
        <p>
          {t(
            "Tim će vas kontaktirati na izabrani način da potvrdi obim, cenu i termin. Za dodatne detalje možete nastaviti razgovor odmah.",
          )}
        </p>
        {result.whatsapp && (
          <a
            className="button button-dark"
            href={result.whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_open", context)}
          >
            {t("Nastavite na WhatsApp")}
            <MessageCircle size={18} />
          </a>
        )}
        <div className="success-next">
          <div className="request-club-invite">
            <strong>{t("Sledeća poseta uz 5% popusta")}</strong>
            <p>
              {t(
                "Pristupite besplatnom klubu pre početka plaćanja. Zahtev možete povezati sa nalogom nakon potvrde iste email adrese.",
              )}
            </p>
            <Link className="button button-light" href="/registracija?club=yes">
              {t("Pristupite besplatnom klubu")}
            </Link>
          </div>
          <p>{t("Za sledeću posetu, plan možemo pripremiti zajedno.")}</p>
          <Link className="text-link" href="/paketi">
            {t("Upoznajte Casa planove")}
            <ArrowUpRight size={16} />
          </Link>
          <Link className="text-link" href="/registracija">
            {t("Napravite nalog za praćenje zahteva")}
          </Link>
        </div>
      </div>
    );
  const options = upgrades.filter((item) => item.slug === service.slug);
  return (
    <form
      onSubmit={submit}
      onFocus={() => {
        if (!leadStarted.current) {
          leadStarted.current = true;
          track("lead_start", context);
        }
      }}
      className="form request-form"
      id={formId}
    >
      {!ready && <BusinessContact placeholder />}
      {!ready && (
        <p className="notice">
          {t(
            "Pregled platforme: prijem zahteva još nije aktivan. Možete pregledati formu; podaci neće biti poslati.",
          )}
        </p>
      )}
      <fieldset disabled={busy} className="request-fields">
        {pestRequest && <PestAssessmentFields key={`${service.slug}:${commerce.collection_id || ""}`} slug={service.slug} collectionId={commerce.collection_id} />}
        {service.slug === "pranje-tepiha" && (
          <WashingEstimate id={formId} onChange={setWashing} />
        )}
        {["ciscenje-doma", "krecenje"].includes(service.slug) && (
          <div className="scope-choice">
            <label>
              {t("Izaberite obim")}
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              >
                <option value="full">
                  {service.slug === "krecenje"
                    ? t("Više prostorija")
                    : t("Ceo dom")}
                </option>
                <option value="priority">
                  {service.slug === "krecenje"
                    ? t("Samo odabrani zidovi")
                    : t("Kuhinja i kupatilo")}
                </option>
                {service.slug === "krecenje" && (
                  <option value="single-room">{t("Jedna soba")}</option>
                )}
              </select>
            </label>
            <p className="fine-print">
              {t(
                "Manji obim je opcija kada želite da ostanete u okviru budžeta. Cenu potvrđujemo nakon procene.",
              )}
            </p>
          </div>
        )}
        {service.slug === "ciscenje-doma" && (
          <label>
            {t("Koliko često vam treba pomoć?")}
            <select
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
            >
              <option value="once">{t("Jednokratno")}</option>
              <option value="weekly">{t("Svake nedelje")}</option>
              <option value="fortnightly">{t("Na dve nedelje")}</option>
              <option value="monthly">{t("Jednom mesečno")}</option>
            </select>
            <small>
              {t(
                "Redovne dolaske i cenu dogovaramo pre početka. Zahtev ne aktivira automatsku pretplatu.",
              )}
            </small>
          </label>
        )}
        <div className="form-row">
          <label>
            {t("Ime i prezime")}
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder={t("Vaše ime")}
            />
          </label>
          <label>
            {t("Telefon")}
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              pattern={"\\+?[0-9\\s\\(\\)\\-]{8,22}"}
              placeholder="+381"
            />
          </label>
        </div>
        <label>
          {t("Deo Beograda")}
          <input
            name="location"
            required
            minLength={3}
            maxLength={240}
            placeholder={t("Opština ili naselje")}
          />
        </label>
        <label>
          {t(pestRequest ? "Opis problema i pristup prostoru" : "Šta želite da preuzmemo?")}
          <textarea
            name="note"
            rows={3}
            maxLength={2000}
            placeholder={serviceHint ? t(serviceHint) : pestRequest ? undefined : t("Zadaci, količine, sprat, lift i vaše želje…")}
            aria-describedby={`${formId}-building-details`}
          />
          <small id={`${formId}-building-details`}>
            {t(
              serviceHint || (pestRequest
                ? "Navedite zahvaćene prostorije, položaj gnezda ili površine, pristup i dostupnost uputstva prethodnog izvođača."
                : "Navedite sprat, dostupnost lifta i pravila zgrade za bučne radove. Termin i pristup dogovaramo pre dolaska."),
            )}
          </small>
        </label>
        {service.slug === "pranje-tepiha" && (
          <WashingExtras
            selected={washingExtras}
            onChange={setWashingExtras}
            context={context}
            limit={2 - additional.length}
          />
        )}
        {(recommendations.length > 0 || options.length > 0) && (
          <details className="visit-extras">
            <summary>{t("Dodajte još nešto ovoj poseti")}</summary>

            <p>
              {t(
                "Izaberite samo ono što vam treba. Dostupnost, redosled radova i svaku doplatu potvrđujemo u ponudi.",
              )}
            </p>
            {options.map((item) => (
              <label className="inline-check" key={item.id}>
                <input
                  type="checkbox"
                  checked={upgradeIds.includes(item.id)}
                  onChange={(event) => {
                    setUpgradeIds(event.target.checked ? [item.id] : []);
                    if (event.target.checked)
                      track("addon_select", `upgrade:${item.id}`);
                  }}
                />
                <span>
                  {t(item.name)}
                  <small>{t(item.description)}</small>
                </span>
              </label>
            ))}
            {recommendations.map((item) => (
              <label className="inline-check" key={item.id}>
                <input
                  type="checkbox"
                  checked={additional.includes(item.id)}
                  disabled={
                    !additional.includes(item.id) &&
                    additional.length + washingExtras.length >= 2
                  }
                  onChange={(event) => {
                    setAdditional((previous) =>
                      event.target.checked
                        ? [...previous, item.id]
                        : previous.filter((id) => id !== item.id),
                    );
                    if (event.target.checked)
                      track("addon_select", `service:${item.id}`);
                  }}
                />
                <span>
                  {t(item.name)}
                  <ClubPrice
                    price={item.price}
                    from
                    unit={servicePricing[item.slug]?.unit}
                    locale={locale}
                    t={t}
                  />
                </span>
              </label>
            ))}
          </details>
        )}
        <details className="contact-details">
          <summary>{t("Dodajte detalje, ako želite")}</summary>
          <div className="form">
            <label>
              {t("Email adresa")}
              <small>{t("(opciono)")}</small>
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="ime@email.com"
              />
            </label>
            <label>
              {t("Željeni datum")}
              <small>{t("(opciono)")}</small>
              <input
                name="desired_at"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
              />
            </label>
            <label className="inline-check">
              <input name="assistant" type="checkbox" />
              <span>
                {t("Zahtev šaljem kao asistent ili za drugo domaćinstvo.")}
              </span>
            </label>
          </div>
        </details>
        <label>
          {t("Kako da vas kontaktiramo?")}
          <select
            name="contact_preference"
            defaultValue={commerce.contact_preference || "phone"}
          >
            <option value="phone">{t("Telefonski poziv")}</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
        <label className="inline-check">
          <input type="checkbox" name="follow_up" />
          <span>
            {t(
              "Želim povremene lične preporuke i podsetnike za narednu uslugu.",
            )}
          </span>
        </label>
        <label className="honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </fieldset>
      <p className="fine-print">
        {t("Slanjem zahteva prihvatate")}{" "}
        <Link href="/uslovi">{t("uslove korišćenja")}</Link>
        {t(". O obradi podataka pročitajte u")}{" "}
        <Link href="/privatnost">{t("obaveštenju o privatnosti")}</Link>.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-dark full" disabled={busy || !ready}>
        {busy ? t("Čuvamo zahtev…") : t(pestRequest ? "Zatražite procenu" : "Pošaljite zahtev")}
        <ArrowUpRight size={17} />
      </button>
      <span className="fine-print center">
        {t("Prvi zahtev bez registracije. Termin potvrđujemo lično.")}
      </span>
    </form>
  );
}
