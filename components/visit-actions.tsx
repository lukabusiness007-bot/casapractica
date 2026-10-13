"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "./locale-provider";
export function VisitActions({
  requestId,
  completed,
}: {
  requestId: string;
  completed: boolean;
}) {
  const t = useTranslation();
  const router = useRouter();
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [action, setAction] = useState(completed ? "repeat" : "reschedule");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <details className="visit-action-form">
      <summary>
        {completed ? t("Ponovite ovu uslugu") : t("Promenite termin ili obim")}
      </summary>
      <form
        className="form"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const values = Object.fromEntries(
              new FormData(event.currentTarget),
            );
            const response = await fetch("/api/posete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...values,
                action,
                request_id: requestId,
                request_key: key,
              }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setMessage(
              `${t(result.message)}${result.reference ? ` ${result.reference}` : ""}`,
            );
            setSent(true);
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error
                ? t(error.message)
                : t("Pokušajte ponovo."),
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy || sent} className="request-fields">
          {!completed && (
            <label>
              {t("Šta želite da promenite?")}
              <select
                value={action}
                onChange={(event) => setAction(event.target.value)}
              >
                <option value="reschedule">{t("Pomeranje termina")}</option>
                <option value="pause">{t("Pauza / preskakanje posete")}</option>
                <option value="less-often">
                  {t("Ređi dolasci ili manji obim")}
                </option>
                <option value="cancel">{t("Otkazivanje")}</option>
              </select>
            </label>
          )}
          {(completed || action === "reschedule") && (
            <label>
              {t("Željeni datum")}
              <input
                type="date"
                name="desired_at"
                required={!completed}
                min={new Date().toLocaleDateString("en-CA", {
                  timeZone: "Europe/Belgrade",
                })}
              />
            </label>
          )}
          {!completed && (
            <>
              <label>
                {t("Razlog (opciono)")}
                <select name="reason" defaultValue="other">
                  <option value="other">{t("Drugi razlog")}</option>
                  <option value="budget">{t("Budžet")}</option>
                  <option value="availability">
                    {t("Termin mi ne odgovara")}
                  </option>
                  <option value="quality">
                    {t("Nisam zadovoljan uslugom")}
                  </option>
                </select>
              </label>
              <label>
                {t("Napomena")}
                <textarea name="note" maxLength={1000} rows={2} />
              </label>
            </>
          )}
          <p className="fine-print">
            {completed
              ? t(
                  "Sačuvani podaci se prenose u novi zahtev. Aktuelnu cenu i termin potvrđuje tim.",
                )
              : t(
                  "Postojeći dogovor važi dok tim ne potvrdi promenu. Ovde ne pokrećete novu naplatu.",
                )}
          </p>
          <button className="button button-dark" disabled={busy || sent}>
            {busy
              ? t("Čuvamo zahtev…")
              : completed
                ? t("Ponovite ovu uslugu")
                : t("Pošaljite zahtev za promenu")}
          </button>
        </fieldset>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {sent && completed && (
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setKey(crypto.randomUUID());
              setSent(false);
              setMessage("");
            }}
          >
            {t("Zatražite još jednu posetu")}
          </button>
        )}
      </form>
    </details>
  );
}
