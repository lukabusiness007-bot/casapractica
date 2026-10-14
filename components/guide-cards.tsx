import { getLocale } from "@/lib/i18n/server";
import { guides } from "@/lib/guides";
import { seoCopy } from "@/lib/seo-copy";
import Link from "./localized-link";
export async function GuideCards() {
  const locale = await getLocale();
  const copy = seoCopy(locale);
  return (
    <section className="guide-section">
      <h2>{copy.guidesTitle}</h2>
      <div className="guide-grid">
        {guides(locale).map((guide) => (
          <article className="guide-card" key={guide.slug}>
            <h3>
              <Link href={`/saveti/${guide.slug}`}>{guide.title}</Link>
            </h3>
            <p>{guide.intro}</p>
            <Link className="text-link" href={`/saveti/${guide.slug}`}>
              {copy.readGuide} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
