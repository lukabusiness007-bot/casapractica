import { Brand } from "@/components/brand";
import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { Gift, Sparkles, Heart, ArrowUpRight } from "lucide-react";
import { currentUser, configured, db, authClient } from "@/lib/supabase";
import { ActionForm } from "@/components/action-form";
export const dynamic = "force-dynamic";
export default async function Club() {
  const t = await getTranslator();

  const user = await currentUser();
  let member = false;
  if (user) {
    const { data } = await db()
      .from("memberships")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    member = !!data;
  }
  const benefits = configured()
    ? (
        await (
          await authClient()
        )
          .from("benefits")
          .select("*")
          .order("member_at", { ascending: false })
      ).data
    : [];
  return (
    <>
      <section className="club-hero">
        <span className="eyebrow">
          <Sparkles size={14} />
          {t("VAŠ KRUG MALIH PRIVILEGIJA")}
        </span>
        <h1>
          {t("Praktične zajedno.")}
          <br />
          <em>{t("Povlašćene, svakog dana.")}</em>
        </h1>
        <p>
          {t(
            "Neke stvari su lepše kada ih delimo. Dobro došli u klub koji čuva vaše vreme i donosi još poneki razlog za osmeh.",
          )}
        </p>
        <div className="membership-card">
          <div className="wordmark">
            <Brand />
          </div>
          <span>{t("casa practica klub · ČLANICA")}</span>
          <strong>cp.</strong>
        </div>
        <span className="fine-print">
          {t("Vaš mali svakodnevni luksuz. Članstvo je besplatno.")}
        </span>
      </section>
      <section className="club-benefits container">
        <div>
          <Gift size={30} />
          <h3>{t("Malo lepše ponude.")}</h3>
          <p>
            {t(
              "Članski popusti i odabrane pogodnosti za usluge koje vaš svakodnevni život čine jednostavnijim.",
            )}
          </p>
        </div>
        <div>
          <Sparkles size={30} />
          <h3>{t("Vi saznajete prvi.")}</h3>
          <p>
            {t(
              "Nove usluge i posebne ponude dostupne članicama pre nego što ih predstavimo svima.",
            )}
          </p>
        </div>
        <div>
          <Heart size={30} />
          <h3>{t("Pripadate svom krugu.")}</h3>
          <p>
            {t(
              "Vaše pogodnosti na jednom mestu, u vašem nalogu. Bez članarine i komplikovanih koraka.",
            )}
          </p>
        </div>
      </section>
      <section className="container">
        {benefits?.map((b) => (
          <article className="panel" key={b.id}>
            <span className="eyebrow">
              {member ? t("VAŠA KLUPSKA POGODNOST") : t("AKTUELNA PONUDA")}
            </span>
            <h3 style={{ marginTop: 12 }}>{b.title}</h3>
            <p>{b.description}</p>
            {b.discount_percent && (
              <span className="badge">
                {b.discount_percent}
                {t("% članskog popusta")}
              </span>
            )}
          </article>
        ))}
      </section>
      <section className="club-join">
        <h2>
          {member
            ? t("Već ste deo našeg kruga.")
            : t("Jedno „da“ za više pogodnosti.")}
        </h2>
        <p>
          {member
            ? t("Vaše dostupne pogodnosti čekaju vas u nalogu.")
            : t(
                "Pristupite besplatno. Konkretne ponude objavljujemo u klubu kada postanu dostupne.",
              )}
        </p>
        {member ? (
          <Link className="button button-dark" href="/nalog">
            {t("Moje pogodnosti")}
            <ArrowUpRight size={17} />
          </Link>
        ) : user ? (
          <ActionForm
            endpoint="/api/clanstvo"
            label={t("Pristupite besplatnom klubu")}
            payload={{ join: true }}
          />
        ) : (
          <Link className="button button-dark" href="/registracija">
            {t("Postanite deo kluba")}
            <ArrowUpRight size={17} />
          </Link>
        )}
        {!configured() && (
          <p className="fine-print">
            {t("Prijave u klub otvaramo nakon aktiviranja platforme.")}
          </p>
        )}
      </section>
    </>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/klub");
}
