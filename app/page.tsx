import Image from "next/image";
import { StructuredData } from "@/components/structured-data";
import { siteUrl, absoluteUrl, homeDescription } from "@/lib/seo";
import { languageTags } from "@/lib/i18n/routing";
import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { getServices } from "@/lib/data";
import { Faq } from "@/components/faq";
import {
  ArrowRight,
  MessageCircle,
  CalendarDays,
  Sparkles,
  House,
} from "lucide-react";
import { ServiceWheel } from "@/components/service-wheel";
import { TrustStandard } from "@/components/trust-standard";
import { ViewEvent } from "@/components/analytics-consent";
import { isIndividualService, servicePriceLabel, serviceCategories, serviceCategory } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Home() {
  const t = await getTranslator();

  const services = await getServices();
  const individualServices = services.filter(isIndividualService);
  const featuredSlugs = [
    "ugradnja-tv-a",
    "servis-klime",
    "kacenje-slika-i-ogledala",
    "pranje-tepiha",
    "nega-garderobe",
    "organizacija-doma",
  ];
  const featured = featuredSlugs.flatMap((slug) =>
    individualServices.filter((service) => service.slug === slug),
  );
  const locale = await getLocale();
  return (
    <>
      <ViewEvent context="home" />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl}/#organization`,
              name: "casa practica",
              url: siteUrl,
              logo: `${siteUrl}/icon.svg`,
              areaServed: { "@type": "City", name: "Belgrade" },
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              name: "casa practica",
              url: siteUrl,
              inLanguage: Object.values(languageTags),
              publisher: { "@id": `${siteUrl}/#organization` },
            },
            {
              "@type": "WebPage",
              "@id": absoluteUrl("/", locale),
              url: absoluteUrl("/", locale),
              name: t("Usluge za stan u Beogradu"),
              description: t(homeDescription),
              inLanguage: languageTags[locale],
              isPartOf: { "@id": `${siteUrl}/#website` },
            },
          ],
        }}
      />
      <section className="casa-hero">
        <Image
          className="casa-hero-poster"
          width={1800}
          height={1350}
          sizes="100vw"
          src="/images/hero.jpg"
          alt=""
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <Link href="/klub" className="hero-news">
          <span>{t("casa practica klub")}</span>
          <span className="hero-news-divider" />
          <em>{t("Članstvo je besplatno.")}</em>
          <ArrowRight size={14} />
        </Link>
        <div className="casa-hero-copy">
          <h1>{t("Šta je potrebno vašem stanu?")}</h1>
          <p>
            {t(
              "Popravke, montaža, održavanje i svakodnevna pomoć za vaš stan. Od slavine koja kaplje do urednog garderobera — više vremena za vas.",
            )}
          </p>
        </div>
        <div className="hero-concierge-actions">
          <Link className="button button-light" href="/konsultacije">
            {t("Zakažite prvu Casa posetu")}
          </Link>
          <Link
            className="hero-concierge-link"
            href="/konsultacije?subscription=ritam"
          >
            {t("Prepustite nam brigu o domu")} →
          </Link>
        </div>
        <div className="casa-hero-bottom">
          <a className="hero-start" href="#kolekcija-usluga">
            <span>
              <Sparkles size={17} />
              {t("Pronađite svoju uslugu")}
            </span>
            <span className="hero-start-icon">
              <House size={20} />
            </span>
          </a>
          <p>{t("Usluge za stan u Beogradu")}</p>
        </div>
      </section>
      <div className="casa-home-content">
        <section className="casa-how container" id="kako-funkcionise">
          <h2>{t("Kako funkcioniše casa practica")}</h2>
          <div className="casa-steps">
            {[
              {
                image: "house",
                title: t("Izaberite uslugu"),
                text: t(
                  "Pronađite uslugu za svoj dom i pošaljite kratak zahtev.",
                ),
              },
              {
                image: "toolbox",
                title: t("Dogovorite detalje"),
                text: t("Cena i termin, u jednostavnom WhatsApp razgovoru."),
              },
              {
                image: "watch",
                title: t("Sačuvajte svoje vreme"),
                text: t("Potvrdite ponudu i termin. Mi preuzimamo posao."),
              },
            ].map((step) => (
              <article key={step.image}>
                <Image
                  src={`/images/casa/${step.image}.webp`}
                  width={56}
                  height={56}
                  alt=""
                />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="casa-tasks">
          <div className="casa-section-heading container">
            <span className="eyebrow eyebrow-peach">{t("USLUGE ZA DOM")}</span>
            <h2>{t("Vaša lista obaveza. Rešena.")}</h2>
            <p>
              {t(
                "TV na zidu, police na svom mestu, sveža posteljina i organizovan garderober. Pažljiva briga o svakom kutku vašeg stana.",
              )}
            </p>
          </div>
          <div className="casa-task-photo">
            <Image
              src="/images/kitchen.jpg"
              alt={t("Usluge za stan u Beogradu")}
              width={1800}
              height={1200}
              sizes="100vw"
              loading="lazy"
            />
            <div className="task-shade" />
            <ServiceWheel services={individualServices.slice(0, 8)} />
          </div>
        </section>
        <section className="home-services container" id="kolekcija-usluga">
          <div className="casa-section-heading">
            <span className="eyebrow eyebrow-sage">{t("USLUGE ZA DOM")}</span>
            <h2>{t("Šta vam treba u stanu?")}</h2>
            <p>
              {t(
                "Izaberite uslugu. Pošaljite zahtev, a mi vam se javljamo sa cenom i predlogom termina.",
              )}
            </p>
          </div>
          <nav className="home-category-links" aria-label={t("Kategorije usluga")}>
            {serviceCategories.filter((category) => category.id !== "gutters" && individualServices.some((service) => serviceCategory(service) === category.id)).map((category) => (
              <Link key={category.id} href={`/usluge#${category.id}`}>
                {t(category.title)}<ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="home-services-grid">
            {(featured.length ? featured : individualServices.slice(0, 6)).map(
              (service) => (
                <Link
                  className="home-service-card"
                  href={`/usluge/${service.slug}`}
                  key={service.id}
                >
                  <div className="home-service-image">
                    <Image
                      src={service.image}
                      width={640}
                      height={480}
                      sizes="(max-width: 760px) 100px, (max-width: 1000px) 50vw, 33vw"
                      alt=""
                      loading="lazy"
                      unoptimized={!service.image.startsWith("/images/")}
                    />
                  </div>
                  <div className="home-service-copy">
                    <h3>{t(service.name)}</h3>
                    <p>
                      {service.price
                        ? servicePriceLabel(service, locale, t)
                        : t("Cena prema obimu posla")}
                    </p>
                    <span>
                      {t("Detalji i zahtev")}
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
          <Link className="button button-light" href="/usluge">
            {t("Pogledajte sve usluge")}
            <ArrowRight size={17} />
          </Link>
        </section>
        <section className="home-help container">
          <article className="home-help-primary">
            <MessageCircle size={28} strokeWidth={1.3} />
            <h2>{t("Samo nam recite šta treba.")}</h2>
            <p>
              {t(
                "Imate više sitnih poslova ili ne znate koju uslugu da izaberete? Opišite nam šta vam treba. Mi ćemo predložiti rešenje i pripremiti ponudu.",
              )}
            </p>
            <Link className="button button-dark" href="/konsultacije">
              {t("Pošaljite svoju listu")}
              <ArrowRight size={17} />
            </Link>
            <small>{t("Slanje zahteva je besplatno i bez obaveze.")}</small>
          </article>
          <article>
            <CalendarDays size={28} strokeWidth={1.3} />
            <h2>{t("Treba vam pomoć redovno?")}</h2>
            <p>
              {t(
                "Peglanje, kućne rutine i briga tokom odsustva. Izaberite svoj mesečni paket.",
              )}
            </p>
            <Link className="text-link" href="/paketi">
              {t("Pogledajte opcije redovne pomoći")}
              <ArrowRight size={17} />
            </Link>
          </article>
        </section>
        <TrustStandard />
        <Faq />
        <section className="home-final-cta container">
          <h2>{t("Jedna poruka. Jedna obaveza manje.")}</h2>
          <p>
            {t(
              "Recite nam šta vam treba. Cenu i termin potvrđujete pre dolaska.",
            )}
          </p>
          <Link className="button button-dark" href="/konsultacije">
            {t("Pošaljite zahtev")}
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/");
}
