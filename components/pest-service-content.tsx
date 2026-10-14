import { getTranslator } from "@/lib/i18n/server";
import { pestContent, pestServices } from "@/lib/pest-services";
import type { Service } from "@/lib/catalog";
import Link from "./localized-link";

export async function PestServiceContent({ slug, available }: { slug?: string; available: Service[] }) {
  const t = await getTranslator();
  const content = slug ? pestContent[slug] : undefined;
  const faqs = [
    ...(content ? [content.faq] : []),
    ["Koliko košta tretman?", "Cena zavisi od vrste problema, kvadrature, pristupa i potrebnog broja poseta. Konačnu ponudu potvrđujete pre realizacije; slanje zahteva se ne naplaćuje."],
    ["Kada mogu da se vratim u prostor?", "Vreme povratka i posebna uputstva zavise od konkretnog postupka. Izvođač ih potvrđuje pre tretmana, zajedno sa pripremom za domaćinstva sa decom i kućnim ljubimcima."],
    ["Da li radite u stambenim zgradama i poslovnim prostorima?", "Možete zatražiti procenu za stan, kuću, zajedničke delove zgrade ili poslovni prostor u Beogradu. Dostupnost izvođača, pristup i odgovarajući obim potvrđujemo za svaki objekat."],
  ];
  const related: Record<string, string[]> = {
    deratizacija: ["preventivna-ddd-zastita", "ciscenje-posle-ddd-tretmana"],
    dezinsekcija: ["tretman-protiv-stenica", "preventivna-ddd-zastita"],
    dezinfekcija: ["ciscenje-doma", "ciscenje-posle-ddd-tretmana"],
    "tretman-protiv-stenica": ["dezinsekcija", "ciscenje-posle-ddd-tretmana"],
    "uklanjanje-gnezda-osa-i-strsljena": ["dezinsekcija", "preventivna-ddd-zastita"],
    "preventivna-ddd-zastita": ["deratizacija", "dezinsekcija", "dezinfekcija"],
    "uklanjanje-neprijatnih-mirisa": ["ciscenje-doma", "sanacija-budji"],
    "ciscenje-posle-ddd-tretmana": ["ciscenje-doma", "dezinfekcija"],
    "sanacija-budji": ["krecenje", "uklanjanje-neprijatnih-mirisa"],
  };
  const choices = (slug ? related[slug] || [] : pestServices.map(service => service.slug))
    .flatMap(value => available.filter(service => service.slug === value && service.active));
  return (
    <div className="service-advice pest-content">
      <section className="plan-information">
        <article><h2>{t("Kako dogovaramo tretman")}</h2>
          <ol className="pest-process">
            {[
              ["Upit i procena", "Opišite problem, tip prostora i kvadraturu. Specijalista potvrđuje potreban pregled i predlog obima."],
              ["Ponuda i termin", "Pre potvrde dobijate obim, cenu, pripremu i dogovor o eventualnim ponovljenim posetama."],
              ["Tretman i kontrola", "Realizaciju i kontrolnu posetu organizujemo prema potvrđenom planu. Dodatne radove i dolaske dogovaramo zasebno."],
            ].map(([title, text]) => <li key={title}><h3>{t(title)}</h3><p>{t(text)}</p></li>)}
          </ol>
        </article>
        <article><h2>{t("Priprema prostora i kontrolne posete")}</h2>
          <p>{t("Navedite prisustvo dece i kućnih ljubimaca, pristup svim zahvaćenim delovima i prethodne tretmane. Pripremu, provetravanje, čišćenje i vreme povratka u prostor potvrđuje izvođač za konkretan postupak.")}</p>
          <p>{t("Ponuda posebno navodi dolazak, tretman, materijal i kontrolu. Potrebu za ponavljanjem, učestalost i eventualnu doplatu potvrđujemo pre zakazivanja; usluga se ne uključuje automatski u redovno čišćenje.")}</p>
        </article>
      </section>
      <section className="seo-faq"><h2>{t("Pitanja pre zakazivanja")}</h2>
        {faqs.map(([q, a]) => <details key={q}><summary>{t(q)}</summary><p>{t(a)}</p></details>)}
      </section>
      {slug && <section className="pest-related"><h2>{t("Povezane usluge i redosled radova")}</h2>
        <p>{t("Povezane usluge imaju zasebnu procenu. Termin čišćenja i drugih radova usklađujemo sa uputstvom izvođača tretmana.")}</p>
        <ul>{choices.map(service => <li key={service.id}><Link href={`/usluge/${service.slug}`}>{t(service.name)}</Link></li>)}</ul>
        <Link className="text-link" href="/ddd">{t("Istražite DDD usluge")} →</Link>
      </section>}
    </div>
  );
}
