import { ArrowUpRight, BadgePercent, ClipboardList, Gift } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import { clubStatus } from "@/lib/club-server";
import { clubBenefits, clubTerms } from "@/lib/club";
import Link from "./localized-link";
import { ActionForm } from "./action-form";

export async function ClubBenefits() {
  const t = await getTranslator();
  const { member, signedIn } = await clubStatus();
  const icons = [BadgePercent, ClipboardList, Gift];
  return (
    <section
      className="club-value container"
      aria-labelledby="club-value-heading"
      id="pristupi"
    >
      <div className="club-value-intro">
        <span className="eyebrow">CASA PRACTICA CLUB</span>
        <h2 id="club-value-heading">{t("Manje obaveza. I 5% manja cena.")}</h2>
        <p>
          {t(
            "Besplatno članstvo, pogodnosti koje koristite pri sledećoj poseti.",
          )}
        </p>
        {member ? (
          <Link className="button button-dark" href="/nalog">
            {t("Moje pogodnosti")}
            <ArrowUpRight size={17} />
          </Link>
        ) : signedIn ? (
          <ActionForm
            endpoint="/api/clanstvo"
            payload={{ join: true }}
            label={t("Pristupite besplatnom klubu")}
          />
        ) : (
          <Link className="button button-dark" href="/registracija?club=yes">
            {t("Pristupite besplatnom klubu")}
            <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
      <div className="club-value-benefits">
        {clubBenefits.map((benefit, index) => {
          const Icon = icons[index];
          return (
            <article key={benefit.title}>
              <Icon size={23} strokeWidth={1.5} />
              <div>
                <h3>{t(benefit.title)}</h3>
                <p>{t(benefit.text)}</p>
              </div>
            </article>
          );
        })}
        <p className="fine-print">{t(clubTerms)}</p>
      </div>
    </section>
  );
}
