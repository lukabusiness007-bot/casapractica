"use client";

import { useState } from "react";
import { ArrowUpRight, Search, Plus, X } from "lucide-react";
import {
  isIndividualService,
  serviceCategories,
  serviceCategory,
  servicePriceLabel,
  type Service,
} from "@/lib/catalog";
import { servicePricing } from "@/lib/service-pricing";
import { serviceScopes } from "@/lib/catalog-additions";
import { useLocale, useTranslation } from "./locale-provider";
import Link from "./localized-link";

const normalize = (value: string) =>
  value.toLocaleLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "dj");

export function ServiceCatalog({ services }: { services: Service[] }) {
  const t = useTranslation();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const search = normalize(query.trim());
  const available = services.filter(isIndividualService);
  const groups = serviceCategories.map((category) => ({
    ...category,
    services: available.filter((service) => {
      if (serviceCategory(service) !== category.id) return false;
      const tasks = serviceScopes[service.slug]?.tasks ?? [];
      return !search || normalize([
        t(category.title), t(service.name), t(service.description),
        ...tasks.map(t), service.name, ...tasks,
      ].join(" ")).includes(search);
    }),
  })).filter((group) => group.services.length);

  return (
    <>
      <div className="catalog-search">
        <Search size={20} aria-hidden="true" />
        <label className="sr-only" htmlFor="service-search">{t("Pretraga usluga")}</label>
        <input
          id="service-search"
          type="search"
          placeholder={t("Pronađite uslugu ili zadatak")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && <button type="button" aria-label={t("Obrišite pretragu")} onClick={() => setQuery("")}><X size={18} /></button>}
      </div>
      <nav className="category-nav" aria-label={t("Kategorije usluga")}>
        {groups.map((category) => (
          <a key={category.id} href={`#${category.id}`}>
            {t(category.title)} <span>{category.services.length}</span>
          </a>
        ))}
      </nav>
      <div role="status" className="catalog-result-status">
        {!groups.length && <p>{t("Nema usluga za ovu pretragu.")}</p>}
      </div>
      {groups.map((category, index) => (
        <section className="catalog-category" id={category.id} key={category.id}>
          <div className="category-heading">
            <span className="catalog-category-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{t(category.title)}</h2>
              <p>{t(category.description)}</p>
            </div>
          </div>
          {([false, true] as const).map((specialist) => {
            const group = category.services.filter((service) => Boolean(serviceScopes[service.slug]?.specialist) === specialist);
            if (!group.length) return null;
            return (
              <div key={String(specialist)} className={specialist ? "catalog-specialists" : undefined}>
                {specialist && <p className="catalog-specialist-heading">{t("Specijalistički radovi")}</p>}
                <div className="catalog-service-grid">
                  {group.map((service) => {
                    const tasks = serviceScopes[service.slug]?.tasks;
                    return (
                      <article className="catalog-service" key={service.id}>
                        <Link className="catalog-service-title" href={`/usluge/${service.slug}`}>
                          <h3>{t(service.name)}</h3><ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                        <div className="catalog-service-price">{servicePriceLabel(service, locale, t)}{servicePricing[service.slug] && <small>{t(servicePricing[service.slug].scope)}</small>}</div>
                        {tasks?.length ? (
                          <details className="catalog-service-scope" open={search ? true : undefined}>
                            <summary>{t("Šta obuhvata usluga")}<Plus size={15} aria-hidden="true" /></summary>
                            <ul>{tasks.map((task) => <li key={task}>{t(task)}</li>)}</ul>
                          </details>
                        ) : <p className="catalog-service-description">{t(service.description)}</p>}
                        {specialist && <span className="catalog-specialist-label">{t("Organizacija specijaliste")}</span>}
                        <Link className="text-link catalog-service-link" href={`/usluge/${service.slug}`}>{t("Pogledajte uslugu")}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
