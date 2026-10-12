"use client";
import { useTranslation } from "@/components/locale-provider";
import Link from "@/components/localized-link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { splitLocale } from "@/lib/i18n/routing";
import { Menu, X, ChevronRight, ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { Brand } from "./brand";
export function Header() {
  const t = useTranslation();

  const dialog = useRef<HTMLDialogElement>(null);
  const home = splitLocale(usePathname()).path === "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <header
        className={`header ${home && !scrolled ? "header-over-hero" : ""}`}
      >
        <div className="header-inner">
          <Link
            className="wordmark"
            href="/"
            aria-label={t("casa practica — početna")}
          >
            <Brand />
          </Link>
          <div className="header-actions">
            <LanguageSwitcher />
            <Link href="/usluge" className="header-benefits">
              {t("Usluge")}
            </Link>
            <Link href="/paketi" className="header-benefits header-plans">
              {t("Casa planovi")}
            </Link>
            <Link href="/konsultacije" className="header-cta">
              {t("Zakažite posetu")}
              <ArrowRight size={17} />
            </Link>
            <button
              className="menu-toggle"
              aria-label={t("Otvori meni")}
              aria-haspopup="dialog"
              onClick={() => dialog.current?.showModal()}
            >
              <Menu size={23} />
              <span>{t("Meni")}</span>
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="navigation-dialog"
        aria-label={t("Glavna navigacija")}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="navigation-panel">
          <div className="navigation-top">
            <Brand />
            <button
              className="icon-button"
              aria-label={t("Zatvori meni")}
              onClick={() => dialog.current?.close()}
            >
              <X size={22} strokeWidth={1.8} />
            </button>
          </div>
          <span className="eyebrow">{t("UMETNOST JEDNOSTAVNIJEG ŽIVOTA")}</span>
          <nav onClick={() => dialog.current?.close()}>
            <Link href="/">
              {t("Početna")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/usluge">
              {t("Naše usluge")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/kolekcije">
              {t("Casa kolekcije")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/konsultacije?tier=signature">
              {t("Casa Concierge")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/klub">
              {t("casa practica klub")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/paketi">
              {t("Casa planovi")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/#kako-funkcionise">
              {t("Kako funkcioniše")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/#pitanja">
              {t("Česta pitanja")}
              <ChevronRight size={16} />
            </Link>
          </nav>
          <div className="navigation-bottom">
            <LanguageSwitcher />
            <Link href="/nalog" onClick={() => dialog.current?.close()}>
              {t("Moj nalog")}
            </Link>
            <span>{t("Beograd, sa pažnjom.")}</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
