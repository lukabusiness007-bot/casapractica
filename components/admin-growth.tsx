import { db } from "@/lib/supabase";
import { money } from "@/lib/catalog";
import { customerMetrics } from "@/lib/customer-metrics";
import type {
  SalesRequest,
  SalesQuote,
  SalesPayment,
} from "@/lib/customer-metrics";
import { ActionForm } from "./action-form";
async function allRows(
  table: string,
  columns: string,
  key = "id",
  since?: string,
) {
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = db()
      .from(table)
      .select(columns)
      .order(key)
      .range(offset, offset + 999);
    if (since) query = query.gte("created_at", since);
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...((data || []) as unknown as Record<string, unknown>[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}
export async function GrowthDashboard() {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [requests, quotes, payments, events] = await Promise.all([
    allRows("requests", "*"),
    allRows("quotes", "id,request_id"),
    allRows("payments", "quote_id,amount,refunded_amount,created_at"),
    allRows(
      "analytics_events",
      "session_id,event_name,context,created_at",
      "event_id",
      since,
    ),
  ]);
  const metrics = customerMetrics(
    requests as unknown as SalesRequest[],
    quotes as unknown as SalesQuote[],
    payments as unknown as SalesPayment[],
  );
  const sessions = new Set(
    events
      .filter((event) => event.event_name === "page_view")
      .map((event) => event.session_id),
  );
  const leads = new Set(
    requests
      .filter((request) => sessions.has(request.analytics_session_id))
      .map((request) => request.analytics_session_id),
  );
  const paidSessions = new Set(
    metrics.paid
      .filter((order) => sessions.has(order.request.analytics_session_id))
      .map((order) => order.request.analytics_session_id),
  );
  const percent = (n: number, d: number) =>
    d ? `${((100 * n) / d).toFixed(1)}%` : "—";
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Belgrade",
  });
  const due = requests
    .filter(
      (request) =>
        request.follow_up_state === "todo" &&
        request.follow_up_at &&
        String(request.follow_up_at) <= today &&
        (request.commerce as { follow_up_opt_in?: boolean })?.follow_up_opt_in,
    )
    .sort((a, b) =>
      String(a.follow_up_at).localeCompare(String(b.follow_up_at)),
    );
  return (
    <>
      <section className="panel">
        <h2>Prihod i ponovna kupovina</h2>
        <p className="fine-print">
          Ostvareni podaci od početka. Prihod je umanjen za povraćaje. Kontakti
          se grupišu po broju telefona bez razmaka i znakova; ovo nije
          predviđanje budućeg LTV-a.
        </p>
        <div className="metrics-grid">
          {[
            ["Neto prihod", money(metrics.revenue)],
            ["Plaćene porudžbine", metrics.orders],
            [
              "Prosečna porudžbina",
              metrics.averageOrder == null
                ? "—"
                : money(Math.round(metrics.averageOrder)),
            ],
            [
              "Ostvareni prihod po kontaktu",
              metrics.realizedValue == null
                ? "—"
                : money(Math.round(metrics.realizedValue)),
            ],
            ["Kontakti koji su platili", metrics.contacts],
            [
              "Doprinos na porudžbinama sa troškom",
              metrics.costCoverage ? money(metrics.contribution) : "—",
            ],
          ].map(([label, value]) => (
            <article key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <p>
          Trošak je unet za {metrics.costCoverage} od {metrics.costableOrders}{" "}
          naplaćenih porudžbina. Doprinos uključuje i troškove potpuno
          refundiranih porudžbina; nije konačan profit firme.
        </p>
        <div className="metrics-grid">
          {metrics.cohort.map((cohort) => (
            <article key={cohort.days}>
              <small>Ponovna kupovina u {cohort.days} dana</small>
              <strong>
                {cohort.rate == null
                  ? "—"
                  : percent(cohort.repeated, cohort.eligible)}
              </strong>
              <span>
                {cohort.repeated} / {cohort.eligible} dovoljno starih kontakata
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>Prodajni tok — poslednjih 30 dana</h2>
        <p className="fine-print">
          Samo sesije koje su dozvolile analitiku. Bez marketing piksela i
          ličnih podataka. Broj sesija nije broj osoba.
        </p>
        <div className="metrics-grid">
          {[
            ["Sesije sa pregledom", sessions.size],
            ["Sesije sa sačuvanim zahtevom", leads.size],
            ["Sesije sa plaćenom porudžbinom", paidSessions.size],
            [
              "Konverzija u plaćanje",
              percent(paidSessions.size, sessions.size),
            ],
          ].map(([label, value]) => (
            <article key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <p>
          Zahtevi sa izabranom dopunom:{" "}
          {
            requests.filter((request) => {
              const context = request.commerce as {
                additional_service_ids?: string[];
                upgrade_ids?: string[];
              };
              return (
                context?.additional_service_ids?.length ||
                context?.upgrade_ids?.length
              );
            }).length
          }
          . Izbor dopune nije potvrda njene realizacije.
        </p>
      </section>
      <section className="panel">
        <h2>Naredni kontakti ({due.length})</h2>
        <p>
          Kontaktirajte prema zabeleženom izboru korisnika. Slanje poruka nije
          automatizovano. Za ocene 1–3 prvo rešite kvalitet usluge.
        </p>
        {due.map((request) => {
          const context = request.commerce as { contact_preference?: string };
          const phone = String(request.phone).replace(/\D/g, "");
          const international = phone.startsWith("00")
            ? phone.slice(2)
            : phone.startsWith("0")
              ? `381${phone.slice(1)}`
              : phone;
          const kind = String(request.follow_up_kind);
          const draft =
            request.satisfaction_score &&
            Number(request.satisfaction_score) <= 3
              ? "Zdravo! Želimo da proverimo šta možemo da popravimo nakon poslednje Casa posete."
              : kind === "satisfaction"
                ? "Zdravo! Kako ste zadovoljni poslednjom Casa posetom?"
                : kind === "retention"
                  ? "Zdravo! Da li bi vam odgovarala pauza, manji obim ili sezonski Casa plan?"
                  : "Zdravo! Želite li da zajedno pripremimo sledeću Casa posetu?";
          return (
            <article className="request-item" key={String(request.id)}>
              <h3>
                {String(request.name)} · {String(request.reference)}
              </h3>
              <p>
                {String(request.follow_up_at)} · {kind} · ocena:{" "}
                {String(request.satisfaction_score || "—")}
              </p>
              <a
                className="text-link"
                href={
                  context.contact_preference === "whatsapp"
                    ? `https://wa.me/${international}?text=${encodeURIComponent(draft)}`
                    : `tel:${String(request.phone)}`
                }
                target={
                  context.contact_preference === "whatsapp"
                    ? "_blank"
                    : undefined
                }
                rel="noreferrer"
              >
                {context.contact_preference === "whatsapp"
                  ? "Otvorite nacrt poruke"
                  : "Pozovite kontakt"}
              </a>
              <ActionForm
                endpoint="/api/admin"
                payload={{ action: "follow-up-done", id: request.id }}
                label="Označite kao završeno"
              />
            </article>
          );
        })}
      </section>
      <section className="panel">
        <h2>Preporuke posle prve uplate</h2>
        <p>
          Nagrade nisu automatski odobrene. Proverite novog klijenta, izvor
          preporuke i objavljene uslove pogodnosti.
        </p>
        {(() => {
          const firstByContact = new Map<
            string,
            (typeof metrics.paid)[number]
          >();
          for (const order of [...metrics.paid].sort(
            (a, b) => a.at.getTime() - b.at.getTime(),
          )) {
            const key = order.request.phone.replace(/\D/g, "");
            if (!firstByContact.has(key)) firstByContact.set(key, order);
          }
          return [...firstByContact.values()]
            .filter((order) => order.request.commerce?.referral_code)
            .map((order) => (
              <p key={order.request.id}>
                {order.request.name} · kod:{" "}
                {order.request.commerce?.referral_code} · {money(order.net)}
              </p>
            ));
        })()}
      </section>
    </>
  );
}
