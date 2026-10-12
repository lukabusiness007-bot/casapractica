"use client";
import { useLocale, useTranslation } from "@/components/locale-provider";
import Link from "./localized-link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import type { Service } from "@/lib/catalog";
import type { PackageSelection } from "@/lib/packages";
import { upgrades, type CommerceInput } from "@/lib/growth";
import { analyticsSession, track } from "@/lib/analytics-client";
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
            additional_service_ids: additional,
            upgrade_ids: upgradeIds,
            booked_for: formData.has("assistant") ? "assistant" : "self",
            contact_preference: formData.get("contact_preference") || "phone",
            follow_up_opt_in: formData.has("follow_up"),
          },
          analytics_session_id: analyticsSession(),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw Error(body.error);
      setResult(body);
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
      onFocus={() => track("lead_start", context)}
      className="form request-form"
      id={formId}
    >
      {!ready && (
        <p className="notice">
          {t(
            "Pregled platforme: prijem zahteva još nije aktivan. Možete pregledati formu; podaci neće biti poslati.",
          )}
        </p>
      )}
      <fieldset disabled={busy} className="request-fields">
        {(recommendations.length > 0 || options.length > 0) && (
          <div className="visit-extras">
            <h3>{t("Zaokružite svoju posetu.")}</h3>
            <p>
              {t(
                "Dok smo kod vas, možemo preuzeti i ove detalje. Obim i doplata u konačnoj ponudi.",
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
                <span>{t(item.name)}</span>
              </label>
            ))}
          </div>
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
          {t("Šta želite da preuzmemo?")}
          <textarea
            name="note"
            rows={3}
            maxLength={2000}
            placeholder={t("Zadaci, količine i vaše želje…")}
          />
        </label>
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
          <select name="contact_preference" defaultValue={commerce.contact_preference || "phone"}>
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
        {busy ? t("Čuvamo zahtev…") : t("Pošaljite zahtev")}
        <ArrowUpRight size={17} />
      </button>
      <span className="fine-print center">
        {t("Prvi zahtev bez registracije. Termin potvrđujemo lično.")}
      </span>
    </form>
  );
}
