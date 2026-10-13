import { growthReady } from "@/lib/data";
import { publicPageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/i18n/routing";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { redirect } from "next/navigation";
import { Sparkles, ClipboardList, ArrowUpRight } from "lucide-react";
import {
  configured,
  currentUser,
  db,
  isAdmin,
  authClient,
} from "@/lib/supabase";
import {
  money,
  statusLabels,
  paymentLabels,
  packageServiceId,
} from "@/lib/catalog";
import { HomeProfileEditor } from "@/components/home-profile-editor";
import { ReferralCard } from "@/components/referral-card";
import { siteUrl } from "@/lib/seo";
import { ActionForm } from "@/components/action-form";
import { ClubWallet } from "@/components/club-wallet";
import { VisitActions } from "@/components/visit-actions";
import { clubReady } from "@/lib/club-server";
import type { QuoteItem } from "@/components/quote-editor";
import { isPublishedService } from "@/lib/service-availability";
export const dynamic = "force-dynamic";
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const t = await getTranslator();
  const locale = await getLocale();

  if (!configured())
    return (
      <div className="container page-section">
        <div className="center-heading">
          <span className="eyebrow">{t("SVE VAŠE, NA JEDNOM MESTU")}</span>
          <h1>
            {t("Vaš mali kutak")}
            <br />
            <em>{t("jednostavnijeg života.")}</em>
          </h1>
          <p>
            {t(
              "Ovde će vas čekati vaši zahtevi, ponude za plaćanje i klupske pogodnosti.",
            )}
          </p>
        </div>
        <div className="panel" style={{ maxWidth: 650, margin: "auto" }}>
          <p className="notice">
            {t(
              "Nalog još nije aktiviran. Za prijavljivanje i čuvanje podataka potrebno je povezivanje sa Supabase servisom.",
            )}
          </p>
          <div className="empty">
            <ClipboardList size={30} />
            <h3>{t("Prva obaveza manje.")}</h3>
            <p>{t("Dok pripremamo vaš kutak, upoznajte naše usluge.")}</p>
            <Link className="button button-dark" href="/usluge">
              {t("Istražite usluge")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  const user = await currentUser();
  if (!user?.email_confirmed_at) redirect(localePath("/prijava", locale));
  const auth = await authClient();
  await auth.rpc("claim_my_requests");
  const growth = await growthReady();
  const club = await clubReady();
  const c = db();
  if (club) {
    const { error } = await c.rpc("expire_club_reservations", { p_user_id: user.id });
    if (error) throw error;
  }
  const [
    { data: requests, error },
    { data: membership },
    { data: benefits },
    { data: profile },
    admin,
    { data: homes, error: homeError },
    { data: referral, error: referralError },
    { data: changes, error: changeError },
  ] = await Promise.all([
    c
      .from("requests")
      .select("*,services(name,slug,active),quotes(*,payments(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    c.from("memberships").select("*").eq("user_id", user.id).maybeSingle(),
    auth.from("benefits").select("*").order("member_at", { ascending: false }),
    c.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    isAdmin(user.id),
    growth
      ? auth
          .from("home_profiles")
          .select("*")
          .order("created_at")
          .eq("user_id", user.id)
      : Promise.resolve({ data: [], error: null }),
    growth
      ? auth
          .from("referral_codes")
          .select("code")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    club ? auth.from("visit_changes").select("request_id,status").eq("user_id", user.id).eq("status", "pending") : Promise.resolve({ data: [], error: null }),
  ]);
  if (error || homeError || referralError || changeError)
    throw error || homeError || referralError || changeError;
  const q = await searchParams;
  return (
    <div className="container page-section">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">{t("VAŠ DAN, MALO JEDNOSTAVNIJI")}</span>
          <h1>
            {t("Zdravo,")}{" "}
            {profile?.full_name?.split(" ")[0] || t("dobro došli")}.
          </h1>
        </div>
        <ActionForm
          endpoint="/api/auth"
          payload={{ mode: "logout" }}
          label={t("Odjavite se")}
          redirect="/"
        />
      </div>
      {q.payment && (
        <p className="notice" style={{ marginBottom: 25 }}>
          {q.payment === "cancelled"
            ? t("Plaćanje je prekinuto. Ponuda ostaje dostupna u vašem nalogu.")
            : t(
                "Proveravamo status uplate. Potvrđena uplata biće prikazana uz ponudu nakon obrade platnog servisa.",
              )}
        </p>
      )}
      {growth && (
        <section className="panel">
          <h2>{t("Vaš dom, upoznat.")}</h2>
          <p>
            {t(
              "Sačuvajte uređaje, želje i naredne zadatke. Svaka sledeća poseta počinje sa više konteksta.",
            )}
          </p>
          {homes?.map((home) => (
            <div key={home.id}>
              {home.maintenance_due && (
                <p className="notice">
                  {t("Podsetnik za održavanje")}:{" "}
                  {new Date(
                    home.maintenance_due + "T12:00:00Z",
                  ).toLocaleDateString(
                    locale === "sr" ? "sr-Latn-RS" : locale,
                    {
                      timeZone: "Europe/Belgrade",
                    },
                  )}{" "}
                  · {home.label}
                </p>
              )}
              <HomeProfileEditor home={home} />
            </div>
          ))}
          <HomeProfileEditor />
        </section>
      )}
      <div className="dashboard-grid">
        <div className="panel">
          <h2>{t("Moji zahtevi")}</h2>
          {!requests?.length ? (
            <div className="empty">
              <ClipboardList size={32} />
              <h3>{t("Vaša lista još je prazna.")}</h3>
              <p>
                {t(
                  "Prepustite nam prvu obavezu i sačuvajte malo vremena za sebe.",
                )}
              </p>
              <Link href="/usluge" className="button button-dark">
                {t("Izaberite uslugu")}
              </Link>
            </div>
          ) : (
            requests.map((r) => (
              <article className="request-item" key={r.id}>
                <div className="request-top">
                  <h3>{t(r.services?.name || "")}</h3>
                  <span className="badge">{t(statusLabels[r.status])}</span>
                </div>
                {r.service_id === packageServiceId && (
                  <p className="package-request-note">{r.note}</p>
                )}
                <p>
                  {r.reference} · {r.location}
                </p>
                {r.appointment_at && (
                  <p>
                    {t("Dogovoreni termin:")}{" "}
                    {new Date(r.appointment_at).toLocaleString(
                      locale === "sr" ? "sr-Latn-RS" : locale,
                      {
                        timeZone: "Europe/Belgrade",
                      },
                    )}
                  </p>
                )}
                {club && r.status !== "cancelled" && (r.status !== "completed" || (r.services?.active && isPublishedService(r.services))) && <VisitActions requestId={r.id} completed={r.status === "completed"} />}
                {club && changes?.some((change) => change.request_id === r.id) && <p className="notice">{t("Tim proverava vaš zahtev za promenu. Postojeći termin važi do potvrde.")}</p>}
                {growth && r.status === "completed" && (
                  <div className="completed-next">
                    <ActionForm
                      endpoint="/api/ocene"
                      payload={{ request_id: r.id }}
                      label={t("Pošaljite ocenu")}
                    >
                      <label>
                        {t("Kako ste zadovoljni posetom?")}
                        <select
                          name="score"
                          required
                          defaultValue={r.satisfaction_score || ""}
                        >
                          <option value="" disabled>
                            {t("Izaberite ocenu")}
                          </option>
                          {[1, 2, 3, 4, 5].map((score) => (
                            <option key={score} value={score}>
                              {score} / 5
                            </option>
                          ))}
                        </select>
                      </label>
                    </ActionForm>
                    <Link
                      className="text-link"
                      href={
                        r.service_id === packageServiceId
                          ? "/konsultacije"
                          : r.services?.active && isPublishedService(r.services) ? "/usluge/" + r.services.slug : "/usluge"
                      }
                    >
                      {t("Dogovorite narednu posetu")}
                    </Link>
                    {r.satisfaction_score >= 4 && (
                      <Link
                        className="text-link"
                        href="/paketi"
                      >
                        {t("Upoznajte Casa planove")}
                      </Link>
                    )}
                  </div>
                )}
                {r.quotes?.map(
                  (offer: {
                    id: string;
                    base_amount: number;
                    discount_amount: number;
                    total_amount: number;
                    description: string;
                    discount_kind?: string;
                    items?: QuoteItem[];
                    payments: { status: string; refunded_amount: number }[];
                  }) => (
                    <div
                      className="panel"
                      style={{ marginTop: 15, marginBottom: 0 }}
                      key={offer.id}
                    >
                      <p>{offer.description}</p>
                      {offer.items?.map((item, index) => <div className="offer-line" key={index}><span>{item.label}</span><span>{money(item.amount, locale)}</span></div>)}
                      <div className="offer-line">
                        <span>{t("Osnovni iznos")}</span>
                        <span>{money(offer.base_amount, locale)}</span>
                      </div>
                      {offer.discount_amount > 0 && (
                        <div className="offer-line">
                          <span>{offer.discount_kind === "referral" ? t("Kredit za preporuku") : offer.discount_kind === "club" ? t("Klupski popust · 5%") : t("Članski popust")}</span>
                          <span>− {money(offer.discount_amount, locale)}</span>
                        </div>
                      )}
                      <div className="offer-line offer-total">
                        <span>{t("Ukupno")}</span>
                        <span>{money(offer.total_amount, locale)}</span>
                      </div>
                      {offer.payments?.length ? (
                        <p className="badge">
                          {t(paymentLabels[offer.payments[0].status])}
                          {offer.payments[0].refunded_amount > 0
                            ? ` · ${money(offer.payments[0].refunded_amount, locale)}`
                            : ""}
                        </p>
                      ) : (
                        r.status !== "cancelled" && (
                          <ActionForm
                            endpoint="/api/checkout"
                            payload={{ quote_id: offer.id }}
                            label={t("Pregledajte i platite ponudu")}
                          />
                        )
                      )}
                    </div>
                  ),
                )}
              </article>
            ))
          )}
        </div>
        <aside>
          {membership && <ClubWallet userId={user.id} />}
          {growth && membership && <ReferralCard code={referral?.code} origin={siteUrl} />}
          <div className="panel">
            <h3>{t("Ritam koji se menja sa vama.")}</h3>
            <p>
              {t(
                "Pauzu, ređe dolaske ili sezonski plan dogovaramo sa timom. Promena ne menja automatski postojeću ponudu.",
              )}
            </p>
            <Link
              className="text-link"
              href="/konsultacije?intent=plan-change&change=pause"
            >
              {t("Dogovorite pauzu")}
            </Link>
            <Link
              className="text-link"
              href="/konsultacije?intent=plan-change&change=less-often"
            >
              {t("Izaberite ređi ritam")}
            </Link>
            <Link
              className="text-link"
              href="/konsultacije?intent=plan-change&change=seasonal"
            >
              {t("Sezonska briga")}
            </Link>
          </div>
          <div className="panel member">
            <Sparkles size={23} />
            <h3 style={{ marginTop: 15 }}>{t("Vaš klub.")}</h3>
            <p>
              {membership
                ? t(
                    "Deo ste Casa Practica Cluba. Imate 5% popusta i lakše ponavljanje usluga.",
                  )
                : t("Besplatno članstvo donosi 5% popusta, ponavljanje usluge i kredit za preporuke.")}
            </p>
            {!membership && (
              <ActionForm
                endpoint="/api/clanstvo"
                label={t("Pristupite besplatno")}
              />
            )}
          </div>
          <div className="panel">
            <h3>{t("Moj profil")}</h3>
            <p>{profile?.full_name}</p>
            <p>{user.email}</p>
            <Link
              href="/prijava?mode=reset"
              className="text-link"
              style={{ marginTop: 15 }}
            >
              {t("Promenite lozinku")}
            </Link>
          </div>
          {admin && (
            <Link href="/admin" className="button button-light full">
              {t("Administracija")}
            </Link>
          )}
        </aside>
      </div>
      {membership && (
        <section className="panel">
          <h2>{t("Članske pogodnosti")}</h2>
          {benefits?.length ? (
            benefits.map((b) => (
              <article key={b.id} className="request-item">
                <h3>{b.title}</h3>
                <p>{b.description}</p>
                {b.discount_percent && (
                  <span className="badge">
                    {b.discount_percent}
                    {t("% članskog popusta")}
                  </span>
                )}
              </article>
            ))
          ) : (
            <p>
              {t(
                "Vaš stalni klupski popust je 5%. Dodatne objavljene pogodnosti prikazujemo ovde.",
              )}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/nalog");
}
