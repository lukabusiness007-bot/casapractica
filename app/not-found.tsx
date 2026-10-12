import { getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
export default async function NotFound() {
  const t = await getTranslator();

  return (
    <div className="loading">
      <span>{t("Ovaj kutak nismo pronašli.")}</span>
      <p>{t("Ali vaša sledeća mala pomoć je tu.")}</p>
      <Link className="button button-dark" href="/usluge">
        {t("Pogledajte usluge")}
      </Link>
    </div>
  );
}
