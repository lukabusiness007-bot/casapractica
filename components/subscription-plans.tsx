import { ArrowRight, Check } from "lucide-react";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { money } from "@/lib/catalog";
import { subscriptions } from "@/lib/subscriptions";
import Link from "./localized-link";

export async function SubscriptionPlans() {
  const t = await getTranslator();
  const locale = await getLocale();
  return (
    <div className="monthly-plans-grid">
      {subscriptions.map((plan) => (
        <article className="plan-card monthly-plan" key={plan.id}>
          <span className="eyebrow">{t(plan.name)}</span>
          <h2>{t(plan.description)}</h2>
          <p className="monthly-plan-price">
            {money(plan.price, locale)} <span>{t("mesečno")}</span>
          </p>
          <ul>
            {plan.includes.map((item) => (
              <li key={item}><Check size={17} aria-hidden="true" /><span>{t(item)}</span></li>
            ))}
          </ul>
          <p className="fine-print">{t(plan.excludes)}</p>
          <Link className="button button-dark" href={`/konsultacije?subscription=${plan.id}`}>
            {t("Izaberite ovaj paket")}<ArrowRight size={17} />
          </Link>
        </article>
      ))}
    </div>
  );
}
