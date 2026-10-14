import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo-copy";
import { BusinessContact } from "./business-contact";
import { getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "@/lib/catalog";
export async function Footer() {
  const t = await getTranslator();
  const copy = seoCopy(await getLocale());
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-invitation">
          <h2>
            {t("Manje obaveza. Više vremena za sebe.")}{" "}
            {t(
              "Pažljivo odabrane usluge za vaš stan i jednostavniji život u gradu.",
            )}
          </h2>
          <p>{t("Premijum briga o domu, sa pažnjom prema vašem vremenu.")}</p>
          <Link href="/klub" className="button">
            {t("Pridružite se klubu")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="footer-top">
          <div>
            <span className="eyebrow">{t("Naše usluge")}</span>
            {serviceCategories.map((category) => (
              <Link href={category.id === "pest-control" ? "/ddd" : `/usluge#${category.id}`} key={category.id}>
                {t(category.title)}
              </Link>
            ))}
            <Link href="/paketi">{t("Redovna pomoć")}</Link>
            <Link href="/kolekcije">{t("Casa kolekcije")}</Link>
            <Link href="/konsultacije">{t("Zakažite posetu")}</Link>
          </div>
          <div>
            <span className="eyebrow">{t("KORISNE INFORMACIJE")}</span>
            <Link href="/o-nama">{copy.aboutTitle}</Link>
            <Link href="/kontakt">{copy.contactTitle}</Link>
            <Link href="/saveti">{copy.guidesTitle}</Link>
            <BusinessContact />
            <Link href="/klub">{t("Naš klub")}</Link>
            <Link href="/paketi#moj-paket">{t("Sastavite svoj paket")}</Link>
            <Link href="/#kako-funkcionise">{t("Kako funkcioniše")}</Link>
            <Link href="/nalog">{t("Moj nalog")}</Link>
            <Link href="/#pitanja">{t("Česta pitanja")}</Link>
            <Link href="/uslovi">{t("Uslovi korišćenja")}</Link>
            <Link href="/privatnost">{t("Privatnost")}</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} casa practica</span>
        <span>{t("Beograd, sa pažnjom.")}</span>
        <Link href="/usluge">{t("Pronađite svoju uslugu")} →</Link>
      </div>
      <div className="footer-large-brand" aria-hidden="true">
        casa practica
      </div>
    </footer>
  );
}
