"use client";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import Link from "./localized-link";
import { useTranslation } from "./locale-provider";
import { clubBenefits } from "@/lib/club";
import { track } from "@/lib/analytics-client";

export function ClubInvitation({
  member,
  signedIn,
  ready,
}: {
  member: boolean;
  signedIn: boolean;
  ready: boolean;
}) {
  const t = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  function dismiss() {
    dialog.current?.close();
    returnFocus.current?.focus();
    try {
      localStorage.setItem(
        "casa-club-dismissed-until",
        String(Date.now() + 7 * 86400000),
      );
    } catch {
      /* Still dismiss when storage is unavailable. */
    }
  }
  useEffect(() => {
    if (member || !ready) {
      dialog.current?.close();
      document.body.style.overflow = "";
      return;
    }
    try {
      if (
        Number(localStorage.getItem("casa-club-dismissed-until")) >
          Date.now() ||
        sessionStorage.getItem("casa-club-shown")
      )
        return;
    } catch {
      /* The invitation works without storage. */
    }
    const timer = window.setTimeout(() => {
      if (
        document.querySelector("dialog[open]") ||
        document.activeElement?.closest("form")
      )
        return;
      returnFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      try {
        sessionStorage.setItem("casa-club-shown", "yes");
      } catch {
        /* Optional frequency cap. */
      }
      track("club_popup_view", "home");
    }, 30000);
    return () => window.clearTimeout(timer);
  }, [member, ready]);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const observer = new MutationObserver(() => {
      if (element.open) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
    });
    observer.observe(element, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      document.body.style.overflow = "";
    };
  }, []);
  if (member || !ready) return null;
  return (
    <dialog
      ref={dialog}
      className="club-dialog"
      aria-labelledby="club-invitation-title"
      aria-describedby="club-invitation-description"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            dismiss();
        }
      }}
    >
      <button
        type="button"
        className="club-dialog-close"
        aria-label={t("Zatvorite poziv u klub")}
        onClick={dismiss}
        autoFocus
      >
        <X size={20} />
      </button>
      <span className="eyebrow">CASA PRACTICA CLUB</span>
      <div className="club-dialog-discount">
        5<span>%</span>
      </div>
      <h2 id="club-invitation-title">{t("Vaš dom. Vaša klupska cena.")}</h2>
      <p id="club-invitation-description">
        {t("Učlanite se besplatno i ostvarite 5% popusta na usluge.")}
      </p>
      <ul className="club-invitation-benefits">
        {clubBenefits.slice(1).map((benefit) => (
          <li key={benefit.title}>
            <Check size={18} />
            <div>
              <strong>{t(benefit.title)}</strong>
              <small>{t(benefit.text)}</small>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href={signedIn ? "/klub#pristupi" : "/registracija?club=yes"}
        className="button button-dark full"
        onClick={() => {
          track("club_cta_click", "home");
          dismiss();
        }}
      >
        {t("Pristupite besplatnom klubu")}
        <ArrowUpRight size={17} />
      </Link>
      <button type="button" className="club-dialog-later" onClick={dismiss}>
        {t("Možda kasnije")}
      </button>
      <p className="fine-print">
        {t(
          "Popust i kredit ne sabiraju se. Cenu i termin potvrđujete pre dolaska.",
        )}
      </p>
    </dialog>
  );
}
