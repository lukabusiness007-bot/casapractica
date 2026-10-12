import Image from "next/image";
import { TrackedLink } from "./tracked-link";
import { collections } from "@/lib/growth";
import { getTranslator } from "@/lib/i18n/server";
export async function CollectionCards() {
  const t = await getTranslator();
  return (
    <div className="collection-grid">
      {collections.map((item) => (
        <TrackedLink
          href={`/kolekcije/${item.id}`}
          event="collection_select"
          context={`collection:${item.id}`}
          className="collection-card"
          key={item.id}
        >
          <div className="collection-image">
            <Image
              src={item.image}
              width={800}
              height={600}
              sizes="(max-width:760px) 100vw, 33vw"
              alt=""
            />
          </div>
          <div>
            <h3>{t(item.name)}</h3>
            <p>{t(item.description)}</p>
            <span className="text-link">{t("Upoznajte kolekciju")} →</span>
          </div>
        </TrackedLink>
      ))}
    </div>
  );
}
