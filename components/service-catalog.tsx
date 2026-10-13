"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Search, Plus, X, Sparkles, HandHeart, Armchair, Droplets, Lightbulb, Wind, PanelsTopLeft, Wifi, Leaf } from "lucide-react";
import {
  isIndividualService,
  serviceCategories,
  serviceCategory,
  type Service,
} from "@/lib/catalog";
import { servicePricing } from "@/lib/service-pricing";
import { washingPriceList } from "@/lib/washing-pricing";
import { serviceScopes } from "@/lib/catalog-additions";
import { useLocale, useTranslation } from "./locale-provider";
import Link from "./localized-link";

import { ClubPrice } from "./club-price";

const icons = { everyday: Sparkles, organization: HandHeart, mounting: Armchair, plumbing: Droplets, electrical: Lightbulb, maintenance: Wind, "doors-windows": PanelsTopLeft, technology: Wifi, gutters: Leaf };
const legacyAnchors: Record<string, string[]> = { mounting: ["furniture"], "doors-windows": ["window-treatments", "walls"] };
const normalize = (value: string) =>
  value.toLocaleLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "dj");

export function ServiceCatalog({ services, initialRepair = false }: { services: Service[]; initialRepair?: boolean }) {
  const t = useTranslation();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("");
  const [repair, setRepair] = useState(initialRepair);
  useEffect(() => setRepair(initialRepair), [initialRepair]);
  const search = normalize(query.trim());
  const available = services.filter((service) => service.active && isIndividualService(service));
  const groups = serviceCategories.map((category) => ({
    ...category,
    services: available.filter((service) => {
      if (repair && (!(["mounting", "plumbing", "electrical", "maintenance", "doors-windows", "technology"].includes(serviceCategory(service))) || service.slug === "krecenje")) return false;
      if (serviceCategory(service) !== category.id) return false;
      const tasks = serviceScopes[service.slug]?.tasks ?? [];
      const washingTerms = service.slug === "pranje-tepiha"
        ? washingPriceList.flatMap((group) => [group.title, ...group.items.flatMap((item) => [item.name, item.detail ?? ""])])
        : [];
      return !search || normalize([
        t(category.title), t(service.name), t(service.description),
        ...tasks.map(t), ...washingTerms.map(t), service.name, ...tasks, ...washingTerms,
      ].join(" ")).includes(search);
    }),
  })).filter((group) => group.services.length);
  const resultCount = groups.reduce((sum, group) => sum + group.services.length, 0);

  useEffect(() => {
    const update = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>(".catalog-category"));
      const current = sections.filter((section) => section.getBoundingClientRect().top <= 160).at(-1) ?? sections[0];
      setActive(current?.id ?? "");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [search, services, repair]);

  return (
    <div id="katalog" className="catalog-browser">
      <div className="catalog-toolbar">
        {repair && <button type="button" className="button button-light" onClick={() => setRepair(false)}>{t("Pogledajte sve usluge")}</button>}
        <div className="catalog-search">
          <Search size={20} aria-hidden="true" />
          <label className="sr-only" htmlFor="service-search">{t("Pretraga usluga")}</label>
          <input id="service-search" type="search" placeholder={t("Pronađite uslugu ili zadatak")} value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" aria-label={t("Obrišite pretragu")} onClick={() => setQuery("")}><X size={18} /></button>}
        </div>
        <p role="status" className="catalog-result-status">{t("Pronađene usluge")}: <strong>{resultCount}</strong></p>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <p className="catalog-nav-label">{t("Kategorije usluga")}</p>
          <nav className="catalog-category-nav" aria-label={t("Kategorije usluga")}>
            {groups.map((category) => {
              const Icon = icons[category.id];
              return (
                <a key={category.id} href={`#${category.id}`} aria-current={active === category.id ? "location" : undefined}>
                  <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  <span>{t(category.title)}</span><small>{category.services.length}</small>
                </a>
              );
            })}
          </nav>
          <div className="catalog-help">
            <HandHeart size={24} strokeWidth={1.3} aria-hidden="true" />
            <h3>{t("Niste sigurni šta vam treba?")}</h3>
            <p>{t("Recite nam šta želite da rešite. Zajedno ćemo pronaći pravu uslugu.")}</p>
            <Link className="text-link" href="/konsultacije">{t("Hajde da se dogovorimo")}<ArrowUpRight size={15} /></Link>
          </div>
        </aside>
        <div className="catalog-results">
          {!groups.length && <div className="catalog-empty"><Search size={28} strokeWidth={1.4} aria-hidden="true" /><h2>{t("Nema usluga za ovu pretragu.")}</h2><p>{t("Pokušajte sa drugim nazivom ili pogledajte sve usluge.")}</p><button className="button button-dark" type="button" onClick={() => { setQuery(""); setRepair(false); }}>{t("Pogledajte sve usluge")}</button></div>}
          {groups.map((category) => {
            const Icon = icons[category.id];
            return (
              <section className="catalog-category" id={category.id} key={category.id} aria-labelledby={`heading-${category.id}`}>
                {legacyAnchors[category.id]?.map((id) => <span className="catalog-anchor" id={id} key={id} />)}
                <div className="category-heading">
                  <span className="catalog-category-icon"><Icon size={25} strokeWidth={1.3} aria-hidden="true" /></span>
                  <div><h2 id={`heading-${category.id}`}>{t(category.title)}</h2><p>{t(category.description)}</p></div>
                </div>
                <div className="catalog-service-grid">
                  {category.services.map((service) => {
                    const scope = serviceScopes[service.slug];
                    const pricing = servicePricing[service.slug];
                    return (
                      <article className="catalog-service" key={service.id}>
                        <Link className="catalog-service-photo" href={`/usluge/${service.slug}`} tabIndex={-1} aria-hidden="true">
                          <Image
                            src={service.image}
                            alt=""
                            width={900}
                            height={600}
                            sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1000px) 36vw, 430px"
                            unoptimized={!service.image.startsWith("/images/")}
                            loading="lazy"
                          />
                        </Link>
                        <div className="catalog-service-body">
                          <Link className="catalog-service-title" href={`/usluge/${service.slug}`}><h3>{t(service.name)}</h3><ArrowUpRight size={18} aria-hidden="true" /></Link>
                          <p className="catalog-service-description">{t(service.tagline)}</p>
                          {scope?.specialist && <span className="catalog-specialist-label">{t("Organizacija specijaliste")}</span>}
                          <div className="catalog-service-price">
                            <ClubPrice price={service.price} from unit={pricing?.unit} locale={locale} t={t} />
                            {service.price !== null && pricing && <p>{t(pricing.scope)}</p>}
                        </div>
                        <details className="catalog-service-scope" open={search ? true : undefined}>
                          <summary>{t("Šta obuhvata usluga")}<Plus size={15} aria-hidden="true" /></summary>
                          {scope?.tasks.length ? <ul>{scope.tasks.map((task) => <li key={task}>{t(task)}</li>)}</ul> : <p>{t(service.description)}</p>}
                        </details>
                        <Link className="text-link catalog-service-link" href={`/usluge/${service.slug}`}>{t("Pogledajte uslugu")}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
