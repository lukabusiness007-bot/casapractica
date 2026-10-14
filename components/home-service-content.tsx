import { getTranslator } from "@/lib/i18n/server";
import { homeServiceDetails } from "@/lib/home-service-additions";
import { relatedServices } from "@/lib/growth";
import type { Service } from "@/lib/catalog";
import Link from "./localized-link";

export async function HomeServiceContent({ service, available }: { service: Service; available: Service[] }) {
  const details = homeServiceDetails[service.slug];
  if (!details) return null;
  const t = await getTranslator();
  const related = relatedServices(service, available);
  return (
    <section className="service-advice">
      <div className="plan-information">
        <article><h2>{t("Priprema za posetu")}</h2><p>{t(details.preparation)}</p></article>
        <article><h2>{t("Dogovorena cena pre dolaska")}</h2><p>{t("Konačnu cenu, dolazak, materijal i dodatne radove potvrđujete pre realizacije.")}</p></article>
      </div>
      <section className="seo-faq"><h2>{t("Pitanja pre zakazivanja")}</h2>
        <details><summary>{t(details.faq[0])}</summary><p>{t(details.faq[1])}</p></details>
      </section>
      {related.length > 0 && <section className="pest-related"><h2>{t("Povezane usluge za vaš prostor")}</h2>
        <ul>{related.map(item => <li key={item.id}><Link href={`/usluge/${item.slug}`}>{t(item.name)}</Link></li>)}</ul>
      </section>}
    </section>
  );
}
