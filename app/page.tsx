import Image from "next/image";
import { StructuredData } from "@/components/structured-data";
import { siteUrl, absoluteUrl, homeDescription } from "@/lib/seo";
import { languageTags } from "@/lib/i18n/routing";
import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { getServices } from "@/lib/data";
import { ServiceCard } from "@/components/service-card";
import { Faq } from "@/components/faq";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Gift,
  Heart,
  House,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { ServiceExplorer } from "@/components/service-explorer";
import { CollectionCards } from "@/components/collection-cards";
import { TrustStandard } from "@/components/trust-standard";
import { ViewEvent } from "@/components/analytics-consent";
import { isIndividualService } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Home() {
  const t = await getTranslator();

  const services = await getServices();
  const individualServices = services.filter(isIndividualService);
  const featuredSlugs = [
    "ugradnja-tv-a",
    "nega-garderobe",
    "montaza-polica",
    "organizacija-doma",
    "dom-na-cuvanju",
    "zamena-sijalica",
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
              name: t("Usluge za dom u Beogradu"),
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
        <HeroVideo />
        <div className="hero-shade" />
        <Link href="/klub" className="hero-news">
          <span>{t("casa practica klub")}</span>
          <span className="hero-news-divider" />
          <em>{t("Članstvo je besplatno.")}</em>
          <ArrowRight size={14} />
        </Link>
        <div className="casa-hero-copy">
          <h1>{t("Dom, bez brige.")}</h1>
          <p>
            {t(
              "Sve što vašem domu treba, na jednom mestu. Prepustite nam svakodnevne obaveze i sačuvajte vreme za ono što volite.",
            )}
          </p>
        </div>
        <div className="hero-concierge-actions">
          <Link className="button button-light" href="/konsultacije">
            {t("Zakažite prvu Casa posetu")}
          </Link>
          <Link
            className="hero-concierge-link"
            href="/konsultacije?tier=signature"
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
          <p>{t("Usluge za dom u Beogradu")}</p>
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
                "Od montaže TV-a do sveže posteljine. Pažljiva briga o svakom detalju vašeg doma.",
              )}
            </p>
          </div>
          <div className="casa-task-photo">
            <Image
              src="/images/kitchen.jpg"
              alt={t("Usluge za dom u Beogradu")}
              width={1800}
              height={1200}
              sizes="100vw"
              loading="lazy"
            />
            <div className="task-shade" />
            <div className="task-wheel">
              <span>{t("Možete li da rešite")}</span>
              <div className="task-wheel-window">
                <div className="task-wheel-list">
                  {[
                    ...individualServices.slice(0, 8),
                    ...individualServices.slice(0, 8),
                  ].map((service, index) => (
                    <Link
                      href={`/usluge/${service.slug}`}
                      key={`${service.id}-${index}`}
                      tabIndex={
                        index >= Math.min(individualServices.length, 8)
                          ? -1
                          : undefined
                      }
                      aria-hidden={
                        index >= Math.min(individualServices.length, 8)
                          ? true
                          : undefined
                      }
                    >
                      {t(service.name).toLocaleLowerCase(locale)}
                      <ArrowUpRight size={26} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {[
          {
            slug: "ugradnja-tv-a",
            title: t("Male popravke. Veliko olakšanje."),
            text: t(
              "Televizor na svom mestu, sijalice koje ponovo svetle. Pošaljite nam detalje, a cenu i termin dogovorite pre dolaska.",
            ),
            link: t("Otkrijte ugradnju TV-a"),
          },
          {
            slug: "pranje-tepiha",
            title: t("Svežina kojoj se vraćate."),
            text: t(
              "Omiljeni tepih zaslužuje novu svežinu. Pošaljite dimenzije i vrstu tepiha, pa sa nama dogovorite pranje, preuzimanje i povratak.",
            ),
            link: t("Otkrijte pranje tepiha"),
          },
        ].map((feature, index) => {
          const service = services.find((item) => item.slug === feature.slug);
          return (
            service && (
              <section
                key={feature.slug}
                className={`casa-feature container ${index % 2 ? "feature-reverse" : ""}`}
              >
                <div className="casa-feature-copy">
                  <h2>{feature.title}</h2>
                  <p>{feature.text}</p>
                  <Link className="text-link" href={`/usluge/${service.slug}`}>
                    {feature.link}
                    <ArrowRight size={18} />
                  </Link>
                </div>
                <Link
                  className="casa-feature-image"
                  href={`/usluge/${service.slug}`}
                >
                  <Image
                    src={service.image}
                    width={1000}
                    height={1200}
                    alt={t(service.name)}
                    sizes="(max-width: 760px) 100vw, 50vw"
                    unoptimized={!service.image.startsWith("/images/")}
                    loading="lazy"
                  />
                </Link>
              </section>
            )
          );
        })}
        <section className="casa-all-services" id="kolekcija-usluga">
          <div className="casa-section-heading container">
            <span className="eyebrow eyebrow-sage">
              {t("SVAKODNEVICA, SA LAKOĆOM")}
            </span>
            <h2>{t("Dom o kome neko brine.")}</h2>
            <p>
              {t("Izaberite svoju uslugu. Detalje ćemo dogovoriti zajedno.")}
            </p>
            <Link className="button button-light" href="/usluge">
              {t("Istražite sve usluge")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <ServiceExplorer
            services={
              featured.length ? featured : individualServices.slice(0, 6)
            }
          />
        </section>
        <section className="casa-everyday container">
          <div className="casa-section-heading">
            <span className="eyebrow">{t("Naše usluge")}</span>
            <h2>{t("I za male, svakodnevne stvari.")}</h2>
          </div>
          <div className="casa-benefits-grid">
            {(featured.length ? featured : individualServices.slice(0, 6)).map(
              (service, index) => (
                <ServiceCard service={service} index={index} key={service.id} />
              ),
            )}
          </div>
        </section>
        <section className="casa-feature container casa-plan-feature">
          <div className="casa-feature-copy">
            <span className="eyebrow">{t("CASA PLANOVI")}</span>
            <h2>{t("Vaš dom. Vaš ritam.")}</h2>
            <p>
              {t(
                "Od jedne pažljivo planirane posete do redovne brige o domu. Premium pažnja u svakom dolasku.",
              )}
            </p>
            <Link className="button button-dark" href="/paketi">
              {t("Sastavite svoj paket")}
              <ArrowRight size={17} />
            </Link>
          </div>
          <Link className="casa-feature-image" href="/paketi">
            <Image
              src="/images/club.jpg"
              width={1000}
              height={1200}
              sizes="(max-width: 760px) 100vw, 50vw"
              alt={t("Briga o domu, po vašoj meri.")}
              loading="lazy"
            />
          </Link>
        </section>
        <section className="home-collections container">
          <div className="casa-section-heading">
            <span className="eyebrow">{t("CASA KOLEKCIJE")}</span>
            <h2>{t("Vaš trenutak. Sve spremno.")}</h2>
            <p>
              {t(
                "Povezane usluge za putovanja, goste, novu sezonu i novi dom. Jedan dogovor za celu listu.",
              )}
            </p>
          </div>
          <CollectionCards />
        </section>
        <TrustStandard />
        <section className="casa-club container">
          <div className="casa-section-heading">
            <span className="eyebrow eyebrow-sage">
              {t("casa practica klub")}
            </span>
            <h2>{t("Više pogodnosti. Bez članarine.")}</h2>
            <p>
              {t("Posebne ponude i male privilegije.")}{" "}
              {t("Članstvo je besplatno.")}
            </p>
          </div>
          <div className="casa-club-benefits">
            {[
              {
                Icon: Gift,
                title: t("Malo lepše ponude."),
                text: t("Članski popusti i odabrane pogodnosti"),
              },
              {
                Icon: Sparkles,
                title: t("Vi saznajete prvi."),
                text: t("Raniji pristup novim uslugama"),
              },
              {
                Icon: UserRound,
                title: t("Sve na jednom mestu."),
                text: t("Vaše pogodnosti u vašem nalogu"),
              },
              {
                Icon: Heart,
                title: t("Praktične zajedno."),
                text: t("Besplatno članstvo"),
              },
            ].map(({ Icon, title, text }) => (
              <Link href="/klub" key={title}>
                <span className="club-benefit-icon">
                  <Icon size={26} strokeWidth={1.2} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
          <div className="casa-club-actions">
            <Link href="/klub" className="button button-dark">
              {t("Upoznajte naš klub")}
              <ArrowRight size={16} />
            </Link>
            <Link href="/usluge" className="button button-light">
              {t("Pronađite svoju uslugu")}
            </Link>
          </div>
        </section>
        <div className="casa-values container">
          <article>
            <span className="value-icon">
              <BadgeCheck size={28} strokeWidth={1.2} />
            </span>
            <h2>{t("Najpre dogovor. Zatim posao.")}</h2>
            <p>
              {t("Dogovorena cena pre dolaska")}.{" "}
              {t("Bez plaćanja prilikom slanja zahteva")}.
            </p>
            <Link className="text-link" href="/usluge">
              {t("Sve usluge")}
              <ArrowRight size={16} />
            </Link>
          </article>
          <article>
            <span className="value-icon">
              <ShieldCheck size={28} strokeWidth={1.2} />
            </span>
            <h2>{t("Vaši podaci. Vaše poverenje.")}</h2>
            <p>
              {t(
                "Podatke iz zahteva koristimo za dogovor i realizaciju vaše usluge.",
              )}
            </p>
            <Link className="text-link" href="/privatnost">
              {t("Privatnost")}
              <ArrowRight size={16} />
            </Link>
          </article>
        </div>
        <Faq />
      </div>
    </>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/");
}
