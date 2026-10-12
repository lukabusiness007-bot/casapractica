import { Brand } from "@/components/brand";
import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import {
  Gift,
  Sparkles,
  Heart,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  House,
} from "lucide-react";
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
        await (await authClient())
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
        {[
          { Icon: House, title: "Vaš profil doma", text: "Uređaji, želje i prethodni zahtevi na jednom mestu. Pri sledećoj poseti nastavljamo od dogovorene liste." },
          { Icon: Heart, title: "Jedna poruka: PONOVI", text: "Ponovite prethodnu uslugu preko WhatsApp-a. Koordinator potvrđuje aktuelnu cenu i novi termin." },
          { Icon: Gift, title: "Preporuka koja se vraća", text: "Po 500 RSD kredita za vas i prijatelja nakon njegove prve izvršene i plaćene usluge od najmanje 10.000 RSD. Tim proverava i potvrđuje pogodnost." },
          { Icon: CalendarDays, title: "Sezonska briga, na vreme", text: "Uz vaš pristanak podsećamo vas na klimu, filtere i pripremu doma pred put. Svaku uslugu posebno potvrđujete." },
          { Icon: ClipboardList, title: "Više zadataka u jednom dolasku", text: "Pošaljite svoju listu. Spajamo kompatibilne poslove i pripremamo jednu ponudu sa jasno iskazanim dolaskom." },
          { Icon: Sparkles, title: "Vaš koordinator za redovnu brigu", text: "Uz mesečni paket dogovaramo stalne termine i vaš način komunikacije. Promene i dodatne poslove rešavate preko jednog kontakta." },
        ].map(({ Icon, title, text }) => <div key={title}><Icon size={30} /><h3>{t(title)}</h3><p>{t(text)}</p></div>)}
      </section>
      <p className="container fine-print center">{t("Najviše jedan klupski kredit po nalogu mesečno. Kredit važi 90 dana, koristi se za sledeću uslugu i ne sabira se sa drugim akcijama.")}</p>
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
      <section className="container club-extra">
        <div className="center-heading">
          <span className="eyebrow">{t("PAŽNJA KOJA TRAJE")}</span>
          <h2>{t("Više od članskog popusta.")}</h2>
          <p>
            {t(
              "Vaši zahtevi i ponude ostaju u nalogu. Lične želje, sezonsku brigu i redovne dolaske dogovaramo kroz vaš Casa plan.",
            )}
          </p>
        </div>
        <div className="club-extra-grid">
          {[
            {
              Icon: ClipboardList,
              title: "Vaš dom, na jednom mestu.",
              text: "Pregledajte istoriju zahteva i ponuda u svom nalogu i nastavite dogovor sa timom.",
            },
            {
              Icon: CalendarDays,
              title: "Termini koji prate vaše navike.",
              text: "Uz redovan Casa plan dogovaramo stalne termine i prednost pri izboru raspoloživih dolazaka.",
            },
            {
              Icon: House,
              title: "Kontinuitet brige.",
              text: "Ličnu listu zadataka, sezonski plan i istu osobu iz tima kada je dostupna usaglašavamo pre početka saradnje.",
            },
          ].map(({ Icon, title, text }) => (
            <article key={title}>
              <Icon size={26} strokeWidth={1.3} />
              <h3>{t(title)}</h3>
              <p>{t(text)}</p>
            </article>
          ))}
        </div>
        <div className="premium-standard">
          <div>
            <h3>{t("Male pažnje, za vaš krug.")}</h3>
            <p>
              {t(
                "Poklon-posete, rođendanske pažnje, nagrade za preporuke i klupski događaji važe kada ih objavimo, prema uslovima konkretne pogodnosti.",
              )}
            </p>
          </div>
          <Link className="button button-dark" href="/paketi">
            {t("Upoznajte Casa planove")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <p className="fine-print center">
          {t(
            "Klub je besplatan. Usluge i Casa planovi plaćaju se odvojeno, prema prihvaćenoj ponudi.",
          )}
        </p>
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
