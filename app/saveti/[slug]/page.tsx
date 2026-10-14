import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n/server";
import { guides } from "@/lib/guides";
import { seoCopy } from "@/lib/seo-copy";
import { pageMetadata, absoluteUrl, siteUrl } from "@/lib/seo";
import { languageTags } from "@/lib/i18n/routing";
import { StructuredData } from "@/components/structured-data";
import { ViewEvent } from "@/components/analytics-consent";
import { GuideCards } from "@/components/guide-cards";
import Link from "@/components/localized-link";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const locale = await getLocale();
  const { slug } = await params;
  const guide = guides(locale).find((item) => item.slug === slug);
  if (!guide) notFound();
  return pageMetadata(locale, `/saveti/${slug}`, guide.title, guide.intro);
}
export default async function Guide({ params }: Props) {
  const locale = await getLocale();
  const { slug } = await params;
  const guide = guides(locale).find((item) => item.slug === slug);
  if (!guide) notFound();
  const copy = seoCopy(locale);
  const url = absoluteUrl(`/saveti/${slug}`, locale);
  return (
    <div className="container page-section">
      <ViewEvent context={`guide:${slug}`} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: guide.title,
              description: guide.intro,
              url,
              inLanguage: languageTags[locale],
              author: {
                "@type": "Organization",
                name: "casa practica",
                "@id": `${siteUrl}/#organization`,
              },
              publisher: {
                "@id": `${siteUrl}/#organization`,
                "@type": "Organization",
                name: "casa practica",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Casa Practica",
                  item: absoluteUrl("/", locale),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: copy.guidesTitle,
                  item: absoluteUrl("/saveti", locale),
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: guide.title,
                  item: url,
                },
              ],
            },
          ],
        }}
      />
      <nav className="seo-breadcrumb" aria-label={copy.guidesTitle}>
        <Link href="/">Casa Practica</Link>
        <span>/</span>
        <Link href="/saveti">{copy.guidesTitle}</Link>
      </nav>
      <article className="prose guide-prose">
        <h1>{guide.title}</h1>
        <p className="lead">{guide.intro}</p>
        {guide.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <div className="guide-actions">
          <Link className="button button-dark" href="/paketi#redovni-planovi">
            {copy.plansLink}
          </Link>
          <Link className="text-link" href="/usluge/ciscenje-doma">
            {copy.cleaningHeading} →
          </Link>
        </div>
      </article>
      <GuideCards />
    </div>
  );
}
