import { getLocale } from "@/lib/i18n/server";
import { serviceAdvice } from "@/lib/service-advice";
import { PlanFaq } from "./plan-content";
import { GuideCards } from "./guide-cards";
import Link from "./localized-link";
export async function ServiceAdvice({ slug }: { slug: string }) {
  const advice = serviceAdvice(slug, await getLocale());
  if (!advice) return null;
  return (
    <section className="service-advice">
      <div className="plan-information">
        <article>
          <h2>{advice.title}</h2>
          <p>{advice.text[0]}</p>
        </article>
        <article>
          <h2>{advice.preparationTitle}</h2>
          <p>{advice.text[1]}</p>
        </article>
      </div>
      <PlanFaq />
      <article className="recurring-callout">
        <h2>{advice.copy.recurringTitle}</h2>
        <p>{advice.copy.recurringText}</p>
        <Link className="button button-dark" href="/paketi#redovni-planovi">
          {advice.copy.plansLink}
        </Link>
      </article>
      {slug === "ciscenje-doma" && <GuideCards />}
    </section>
  );
}
