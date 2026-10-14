"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "./locale-provider";
import {
  track,
  rememberLanding,
  clearAttribution,
} from "@/lib/analytics-client";
export function ViewEvent({ context }: { context: string }) {
  useEffect(() => {
    const send = () => track("page_view", context);
    send();
    window.addEventListener("casa-analytics-choice", send);
    return () => window.removeEventListener("casa-analytics-choice", send);
  }, [context]);
  return null;
}
export function AnalyticsConsent({ ready }: { ready: boolean }) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!ready) return;
    rememberLanding();
    try {
      setOpen(localStorage.getItem("casa-analytics") === null);
    } catch {}
  }, [ready]);
  function choose(allowed: boolean) {
    try {
      localStorage.setItem("casa-analytics", allowed ? "yes" : "no");
      if (!allowed) {
        sessionStorage.removeItem("casa-session");
        clearAttribution();
      }
    } catch {}
    setOpen(false);
    window.dispatchEvent(new Event("casa-analytics-choice"));
  }
  if (!ready) return null;
  return (
    <>
      <button className="privacy-settings" onClick={() => setOpen(true)}>
        {t("Podešavanja privatnosti")}
      </button>
      {open && (
        <aside
          className="analytics-consent"
          aria-label={t("Podešavanja privatnosti")}
        >
          <p>
            {t(
              "Uz vaš izbor merimo korišćenje sajta bez imena, kontakta ili adrese. Osnovne funkcije rade i bez analitike.",
            )}
          </p>
          <div>
            <button
              className="button button-light"
              onClick={() => choose(false)}
            >
              {t("Samo neophodno")}
            </button>
            <button className="button button-dark" onClick={() => choose(true)}>
              {t("Dozvoli analitiku")}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
