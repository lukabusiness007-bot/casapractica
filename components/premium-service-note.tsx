import { getTranslator } from "@/lib/i18n/server";

export async function PremiumServiceNote() {
  const t = await getTranslator();
  return <p className="premium-service-note">{t("Premijum pristup: jasna ponuda, pažljivo planirana poseta i briga o detaljima.")}</p>;
}
