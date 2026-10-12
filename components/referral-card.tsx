"use client";
import { useState } from "react";
import { useTranslation } from "./locale-provider";
import { useLocale } from "./locale-provider";
import { localePath } from "@/lib/i18n/routing";
export function ReferralCard({
  code: initial,
  origin,
}: {
  code?: string;
  origin: string;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const [code, setCode] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const url = code
    ? `${origin}${localePath("/konsultacije", locale)}?ref=${code}`
    : "";
  return (
    <div className="panel">
      <h3>{t("Pozovite nekoga u svoj krug.")}</h3>
      <p>
        {t(
          "Podelite svoj link. Pogodnosti za preporuke važe nakon prve plaćene usluge novog klijenta, prema objavljenim uslovima kluba.",
        )}
      </p>
      {code && (
        <input
          className="referral-url"
          readOnly
          value={url}
          aria-label={t("Vaš link za preporuku")}
        />
      )}
      <button
        className="button button-dark"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            if (code) {
              await navigator.clipboard.writeText(url);
              setMessage(t("Link je kopiran."));
            } else {
              const response = await fetch("/api/preporuke", {
                method: "POST",
              });
              const data = await response.json();
              if (!response.ok) throw Error(data.error);
              setCode(data.code);
            }
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
        {code ? t("Kopirajte link") : t("Napravite svoj link")}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
