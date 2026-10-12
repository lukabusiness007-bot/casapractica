import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { money, type Service } from "@/lib/catalog";
export async function ServiceCard({
  service,
}: {
  service: Service;
  index?: number;
}) {
  const t = await getTranslator();
  const locale = await getLocale();

  return (
    <Link href={`/usluge/${service.slug}`} className="service-card">
      <div className="service-image">
        <Image
          width={900}
          height={1100}
          sizes="(max-width: 760px) 100vw, 50vw"
          unoptimized={!service.image.startsWith("/images/")}
          src={service.image}
          alt={t(service.name)}
          loading="lazy"
        />
      </div>
      <div className="service-card-text">
        <h3>{t(service.name)}</h3>
        <p>{t(service.tagline)}</p>
        <div className="service-card-bottom">
          <span className="service-price">
            {service.price
              ? `${t("Od")} ${money(service.price, locale)}`
              : t("Cena na upit")}
          </span>
          <span className="service-card-action">
            {t("Pogledajte uslugu")}
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}
