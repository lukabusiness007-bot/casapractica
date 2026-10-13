import { getLocale, getTranslator } from "@/lib/i18n/server";
import { db } from "@/lib/supabase";
import { clubReady } from "@/lib/club-server";
import { money } from "@/lib/catalog";
export async function ClubWallet({ userId }: { userId: string }) {
  const t = await getTranslator();
  const locale = await getLocale();
  if (!(await clubReady()))
    return (
      <div className="panel club-wallet">
        <h3>{t("Vaš klupski kredit")}</h3>
        <p>
          {t(
            "Pregled kredita biće dostupan nakon aktiviranja evidencije. Klupski popust je 5%.",
          )}
        </p>
      </div>
    );
  const { data: credits, error } = await db()
    .from("club_credits")
    .select("id,amount,status,expires_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const now = Date.now();
  const balance = (credits || [])
    .filter(
      (credit) =>
        credit.status === "available" &&
        new Date(credit.expires_at).getTime() > now,
    )
    .reduce((sum, credit) => sum + Number(credit.amount), 0);
  const labels: Record<string, string> = {
    pending: "Na čekanju — tim proverava uslove",
    available: "Dostupan",
    reserved: "Uključen u ponudu",
    redeemed: "Iskorišćen",
    reversed: "Povučen nakon provere ili povraćaja",
  };
  return (
    <div className="panel club-wallet">
      <span className="eyebrow">{t("VAŠ KLUPSKI KREDIT")}</span>
      <h3 className="club-wallet-balance">{money(balance, locale)}</h3>
      <p>
        {t(
          "Na sledećoj ponudi koristite 5% popusta ili jedan kredit kada je povoljniji. Pogodnosti se ne sabiraju.",
        )}
      </p>
      <ul>
        {credits?.map((credit) => (
          <li key={credit.id}>
            <strong>{money(credit.amount, locale)}</strong> ·{" "}
            {t(
              credit.status === "available" &&
                new Date(credit.expires_at).getTime() <= now
                ? "Istekao"
                : labels[credit.status],
            )}
            {credit.expires_at && (
              <small>
                {t("Važi do")}:{" "}
                {new Date(credit.expires_at).toLocaleDateString(locale, {
                  timeZone: "Europe/Belgrade",
                })}
              </small>
            )}
          </li>
        ))}
      </ul>
      {!credits?.length && (
        <p className="fine-print">
          {t(
            "Još nema kredita. Podelite link za preporuku i pratite uslove kluba.",
          )}
        </p>
      )}
    </div>
  );
}
