import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo-copy";
import Link from "./localized-link";
export async function PlanContent() {
  const copy = seoCopy(await getLocale());
  return (
    <>
      <section
        id="redovni-planovi"
        className="regular-plans"
        aria-label={copy.plansHeading}
      >
        <div className="regular-plan-grid">
          {copy.planChoices.map((plan) => (
            <article className="regular-plan-card" key={plan.id}>
              <span className="eyebrow">
                {plan.id === "monthly"
                  ? "Casa Signature"
                  : plan.id === "weekly"
                    ? "Casa Private"
                    : "Moja Casa"}
              </span>
              <h2>{plan.title}</h2>
              <p>{plan.text}</p>
              <strong>{copy.priceOnQuote}</strong>
              <Link
                className="button button-dark"
                href={
                  plan.id === "custom"
                    ? "/paketi#moj-paket"
                    : `/konsultacije?tier=${plan.tier}`
                }
              >
                {plan.id === "custom" ? copy.buildPlan : copy.requestQuote} →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="plan-information">
        {copy.planDetails.map(([heading, text]) => (
          <article key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
export async function PlanFaq() {
  const copy = seoCopy(await getLocale());
  return (
    <section className="seo-faq">
      <h2>{copy.frequentlyAsked}</h2>
      {copy.faq.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </section>
  );
}
