"use client";
import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Armchair,
  Trash2,
  Tv,
  Lightbulb,
  Wind,
  House,
} from "lucide-react";
import type { Service } from "@/lib/catalog";
import Link from "./localized-link";
import { useTranslation } from "./locale-provider";
const icons = {
  "pranje-tepiha": Armchair,
  "iznosenje-smeca": Trash2,
  "ugradnja-tv-a": Tv,
  "zamena-sijalica": Lightbulb,
  "servis-klime": Wind,
};
export function ServiceExplorer({ services }: { services: Service[] }) {
  const t = useTranslation();
  const [selected, setSelected] = useState(0);
  const service = services[selected];
  if (!service) return null;
  return (
    <div className="service-explorer">
      <div
        id="service-panel"
        role="tabpanel"
        aria-labelledby={`service-tab-${selected}`}
        className="explorer-image"
      >
        <Image
          src={service.image}
          alt={t(service.name)}
          width={1200}
          height={700}
          sizes="(max-width: 760px) 100vw, 880px"
          unoptimized={!service.image.startsWith("/images/")}
        />
        <Link className="explorer-image-link" href={`/usluge/${service.slug}`}>
          {t(service.name)}
          <ArrowRight size={18} />
        </Link>
      </div>
      <div
        className="explorer-tabs"
        role="tablist"
        aria-label={t("Naše usluge")}
      >
        {services.map((item, index) => {
          const Icon = icons[item.slug as keyof typeof icons] || House;
          return (
            <button
              key={item.id}
              role="tab"
              id={`service-tab-${index}`}
              aria-selected={index === selected}
              aria-controls="service-panel"
              tabIndex={index === selected ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % services.length;
                else if (event.key === "ArrowLeft")
                  next = (index + services.length - 1) % services.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = services.length - 1;
                else return;
                event.preventDefault();
                setSelected(next);
                document.getElementById(`service-tab-${next}`)?.focus();
              }}
            >
              <Icon size={22} strokeWidth={1.3} />
              <span>{t(item.name)}</span>
            </button>
          );
        })}
      </div>
      <p className="explorer-description">{t(service.description)}</p>
      <Link className="text-link" href={`/usluge/${service.slug}`}>
        {t("Pošaljite zahtev")}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
