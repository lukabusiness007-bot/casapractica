import Link from "next/link";
import { redirect } from "next/navigation";
import { configured, currentUser, isAdmin, db } from "@/lib/supabase";
import {
  ServiceEditor,
  BenefitEditor,
  RequestEditor,
} from "@/components/admin-forms";
import { ActionForm } from "@/components/action-form";
import { money, paymentLabels } from "@/lib/catalog";
export const metadata = {
  title: "Administracija",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!configured())
    return (
      <div className="container page-section">
        <h1>Administracija</h1>
        <p className="notice" style={{ marginTop: 30 }}>
          Za administraciju su potrebni Supabase konfiguracija, izvršena
          migracija i administratorski nalog. Pristupni podaci se ne postavljaju
          u javni kod.
        </p>
      </div>
    );
  const u = await currentUser();
  if (!u) redirect("/prijava");
  if (!(await isAdmin(u.id))) redirect("/nalog");
  const { tab = "zahtevi" } = await searchParams;
  const c = db();
  return (
    <div className="container page-section">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">casa practica · TIM</span>
          <h1>Administracija</h1>
        </div>
        <Link className="text-link" href="/nalog">
          Moj nalog
        </Link>
      </div>
      <nav className="admin-tabs">
        {[
          ["zahtevi", "Zahtevi i ponude"],
          ["usluge", "Usluge"],
          ["pogodnosti", "Klupske pogodnosti"],
          ["clanice", "Članice"],
        ].map(([v, l]) => (
          <Link
            className={tab === v ? "active" : ""}
            key={v}
            href={`/admin?tab=${v}`}
          >
            {l}
          </Link>
        ))}
      </nav>
      {await (async () => {
        if (tab === "usluge") {
          const { data, error } = await c
            .from("services")
            .select("*")
            .order("sort_order");
          if (error) throw error;
          return (
            <div className="admin-grid">
              <div className="panel">
                <h2>Nova usluga</h2>
                <ServiceEditor />
              </div>
              {data?.map((s) => (
                <div className="panel" key={s.id}>
                  <h2>{s.name}</h2>
                  <ServiceEditor service={s} />
                </div>
              ))}
            </div>
          );
        }
        if (tab === "pogodnosti") {
          const { data, error } = await c
            .from("benefits")
            .select("*")
            .order("member_at", { ascending: false });
          if (error) throw error;
          return (
            <div className="admin-grid">
              <div className="panel">
                <h2>Nova pogodnost</h2>
                <BenefitEditor />
              </div>
              {data?.map((b) => (
                <div className="panel" key={b.id}>
                  <h2>{b.title}</h2>
                  <BenefitEditor benefit={b} />
                </div>
              ))}
            </div>
          );
        }
        if (tab === "clanice") {
          const { data, error } = await c
            .from("memberships")
            .select("*")
            .order("joined_at", { ascending: false });
          if (error) throw error;
          const ids = data?.map((m) => m.user_id) || [];
          const { data: profiles } = ids.length
            ? await c.from("profiles").select("id,full_name").in("id", ids)
            : { data: [] };
          return (
            <div className="panel">
              <h2>Članice kluba ({data?.length || 0})</h2>
              {data?.length ? (
                data.map((m) => (
                  <div className="request-item" key={m.user_id}>
                    <h3>
                      {profiles?.find((p) => p.id === m.user_id)?.full_name ||
                        "Članica"}
                    </h3>
                    <p>
                      Pristupila:{" "}
                      {new Date(m.joined_at).toLocaleDateString("sr-Latn-RS")}
                    </p>
                  </div>
                ))
              ) : (
                <p>Još nema članica.</p>
              )}
            </div>
          );
        }
        const { data, error } = await c
          .from("requests")
          .select("*,services(name),quotes(*,payments(*))")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (
          <div className="admin-grid">
            {!data?.length && (
              <div className="panel admin-full">
                <h2>Još nema zahteva.</h2>
                <p>
                  Novi zahtevi pojaviće se ovde, uključujući one za koje
                  WhatsApp poruka nije poslata.
                </p>
              </div>
            )}
            {data?.map((r) => {
              const q = r.quotes?.[0];
              return (
                <article className="panel" key={r.id}>
                  <span className="eyebrow">{r.reference}</span>
                  <h2 style={{ marginTop: 12 }}>{r.services?.name}</h2>
                  <p>
                    <strong>{r.name}</strong> · {r.email} · {r.phone}
                  </p>
                  <p>
                    {r.location} · Željeni datum:{" "}
                    {r.desired_at || "po dogovoru"}
                  </p>
                  <p style={{ whiteSpace: "pre-wrap", margin: "10px 0 20px" }}>
                    {r.note}
                  </p>
                  <RequestEditor
                    id={r.id}
                    status={r.status}
                    appointment={r.appointment_at}
                  />
                  <hr style={{ margin: "25px 0", borderColor: "#dce2dc" }} />
                  <h3>Konačna ponuda</h3>
                  {q?.locked ? (
                    <div>
                      <p className="notice">
                        Ponuda je zaključana jer je započeto plaćanje. Iznos:{" "}
                        {money(q.total_amount)}.
                      </p>
                      {q.payments?.map(
                        (p: {
                          id: string;
                          status: string;
                          refunded_amount: number;
                        }) => (
                          <p key={p.id}>
                            {paymentLabels[p.status]}
                            {p.refunded_amount > 0
                              ? ` · vraćeno ${money(p.refunded_amount)}`
                              : ""}
                          </p>
                        ),
                      )}
                      <p className="fine-print">
                        Povraćaj pokrenite u Stripe administraciji. Status se
                        sinhronizuje preko webhook-a.
                      </p>
                    </div>
                  ) : (
                    <ActionForm
                      endpoint="/api/admin"
                      payload={{ action: "quote", request_id: r.id }}
                      label="Sačuvajte ponudu"
                    >
                      <label>
                        Opis dogovorene usluge
                        <textarea
                          name="description"
                          required
                          minLength={5}
                          defaultValue={q?.description || r.services?.name}
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Osnovni iznos (RSD)
                          <input
                            name="base_amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            defaultValue={q ? q.base_amount / 100 : ""}
                          />
                        </label>
                        <label>
                          Članski popust (RSD)
                          <input
                            name="discount_amount"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            defaultValue={q ? q.discount_amount / 100 : 0}
                          />
                        </label>
                      </div>
                      <p className="fine-print">
                        Korisnica vidi ponudu kada potvrdi isti email u svom
                        nalogu. Link do naloga možete poslati u WhatsApp
                        razgovoru. Članski popust dozvoljen je samo članicama.
                      </p>
                    </ActionForm>
                  )}
                </article>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
