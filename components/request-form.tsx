"use client";
import { useLocale, useTranslation } from "@/components/locale-provider";
import Link from "./localized-link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import type { Service } from "@/lib/catalog";
import type { PackageSelection } from "@/lib/packages";
export function RequestForm({
  service,
  ready,
  packageSelection,
  formId = "zahtev",
  onBusyChange,
}: {
  service: Service;
  ready: boolean;
  packageSelection?: PackageSelection;
  formId?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const t = useTranslation();
  const locale = useLocale();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reference: string;
    whatsapp: string | null;
  } | null>(null);
  const selectionKey = JSON.stringify(packageSelection);
  useEffect(() => {
    setResult(null);
    setError("");
  }, [selectionKey]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch("/api/zahtevi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          ...data,
          service_id: service.id,
          ...(packageSelection ? { package: packageSelection } : {}),
        }),
      });
      const body = await r.json();
      if (!r.ok) throw Error(body.error);
      setResult(body);
    } catch (e) {
      setError(e instanceof Error ? t(e.message) : t("Pokušajte ponovo."));
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
            "Još jedan korak: pošaljite pripremljenu poruku da dogovorimo detalje. Termin još nije potvrđen.",
          )}
        </p>
        {result.whatsapp ? (
          <a
            className="button button-dark"
            href={result.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            {t("Nastavite na WhatsApp")}
            <MessageCircle size={18} />
          </a>
        ) : (
          <p className="notice">
            {t(
              "WhatsApp kontakt još nije podešen. Vaš zahtev je vidljiv timu u administraciji.",
            )}
          </p>
        )}
        <Link className="text-link" href="/registracija">
          {t("Napravite nalog za praćenje zahteva")}
          <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  return (
    <form onSubmit={submit} className="form request-form" id={formId}>
      {!ready && (
        <p className="notice">
          {t(
            "Pregled platforme: prijem zahteva još nije aktivan. Možete pregledati formu; podaci neće biti poslati.",
          )}
        </p>
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
        {t("Email adresa")}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="ime@email.com"
        />
      </label>
      <div className="form-row">
        <label>
          {t("Lokacija u Beogradu")}
          <input
            name="location"
            autoComplete="street-address"
            required
            minLength={3}
            maxLength={240}
            placeholder={t("Opština i adresa")}
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
      </div>
      <label>
        {t("Napomena")}
        <small>{t("(opciono)")}</small>
        <textarea
          name="note"
          rows={3}
          maxLength={2000}
          placeholder={t("Recite nam malo više…")}
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
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
        {busy ? t("Čuvamo zahtev…") : t("Dogovori preko WhatsApp-a")}
        <ArrowUpRight size={17} />
      </button>
      <span className="fine-print center">
        {t("Prvi zahtev bez registracije. Termin potvrđujemo lično.")}
      </span>
    </form>
  );
}
