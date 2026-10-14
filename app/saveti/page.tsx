import { GuideCards } from "@/components/guide-cards";
import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo-copy";
import { publicPageMetadata } from "@/lib/seo";
import { ViewEvent } from "@/components/analytics-consent";
export default async function Guides() {
  const copy = seoCopy(await getLocale());
  return (
    <div className="container page-section">
      <ViewEvent context="guides" />
      <div className="center-heading">
        <h1>{copy.guidesTitle}</h1>
        <p>{copy.guidesDescription}</p>
      </div>
      <GuideCards />
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/saveti");
}
