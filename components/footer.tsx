import { getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { ArrowRight } from "lucide-react";
import { getServices } from "@/lib/data";
export async function Footer() {
  const t = await getTranslator();
  const services = await getServices();
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-invitation">
          <h2>
            {t("Manje obaveza. Više vremena za sebe.")}{" "}
            {t(
              "Pažljivo odabrane usluge za vaš dom i jedan jednostavniji svakodnevni život.",
            )}
          </h2>
          <p>{t("Posebne ponude i male privilegije.")}</p>
          <Link href="/klub" className="button">
            {t("Pridružite se klubu")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="footer-top">
          <div>
            <span className="eyebrow">{t("Naše usluge")}</span>
            {services.map((service) => (
              <Link href={`/usluge/${service.slug}`} key={service.id}>
                {t(service.name)}
              </Link>
            ))}
          </div>
          <div>
            <span className="eyebrow">{t("KORISNE INFORMACIJE")}</span>
            <Link href="/klub">{t("Naš klub")}</Link>
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
