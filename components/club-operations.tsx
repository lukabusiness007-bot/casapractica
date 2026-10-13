import { db } from "@/lib/supabase";
import { clubReady } from "@/lib/club-server";
import { ActionForm } from "./action-form";
import Link from "next/link";
export async function ClubOperations() {
  if (!(await clubReady()))
    return (
      <p className="notice">
        Primenite migraciju 009_club_conversion.sql za kreditnu evidenciju i
        promene poseta.
      </p>
    );
  const c = db();
  const [credits, changes] = await Promise.all([
    c
      .from("club_credits")
      .select("source_request_id,user_id,requests(reference,name)")
      .eq("status", "pending")
      .order("created_at"),
    c
      .from("visit_changes")
      .select("*,requests(reference,name,phone,appointment_at)")
      .eq("status", "pending")
      .order("created_at"),
  ]);
  if (credits.error || changes.error) throw credits.error || changes.error;
  const referrals = [
    ...new Map(
      (credits.data || []).map((credit) => [credit.source_request_id, credit]),
    ).values(),
  ];
  const actions: Record<string, string> = {
    reschedule: "Pomeranje termina",
    cancel: "Otkazivanje",
    pause: "Pauza / preskakanje",
    "less-often": "Ređi ritam / manji obim",
  };
  const reasons: Record<string, string> = {
    budget: "Budžet",
    availability: "Dostupnost",
    quality: "Kvalitet — prvo rešite reklamaciju",
    other: "Drugi razlog",
  };
  return (
    <>
      <section className="panel">
        <h2>Preporuke za proveru ({referrals.length})</h2>
        <p>
          Proverite identitet i izvor preporuke. Server proverava prvu neto
          plaćenu i završenu uslugu od 10.000 RSD, članstvo obe osobe i najviše
          jedan kredit po osobi mesečno. Svaka osoba dobija 500 RSD, sa rokom 90
          dana.
        </p>
        {referrals.map((credit) => {
          const request = credit.requests as unknown as {
            reference: string;
            name: string;
          };
          return (
            <article className="request-item" key={credit.source_request_id}>
              <h3>
                {request?.name} · {request?.reference}
              </h3>
              <ActionForm
                endpoint="/api/admin"
                payload={{
                  action: "approve-referral",
                  request_id: credit.source_request_id,
                }}
                label="Odobrite oba kredita nakon provere"
              />
            </article>
          );
        })}
        {!referrals.length && <p>Nema preporuka na čekanju.</p>}
      </section>
      <section className="panel">
        <h2>Promene poseta ({changes.data?.length || 0})</h2>
        <p>
          Usaglasite novi termin, obim i eventualnu obradu naplate sa klijentom,
          pa ažurirajte originalni zahtev. Tek potom označite promenu kao
          rešenu.
        </p>
        {changes.data?.map((change) => {
          const request = change.requests as unknown as {
            reference: string;
            name: string;
            phone: string;
          };
          return (
            <article className="request-item" key={change.id}>
              <h3>
                {request?.name} · {request?.reference}
              </h3>
              <p>
                {actions[change.action]} · {reasons[change.reason]}
                {change.desired_at
                  ? ` · željeni datum: ${change.desired_at}`
                  : ""}
              </p>
              <p>{change.note}</p>
              <a className="text-link" href={`tel:${request?.phone}`}>
                Kontaktirajte klijenta
              </a>
              <Link
                className="text-link"
                href={`/admin?tab=zahtevi#request-${change.request_id}`}
              >
                Otvorite originalni zahtev
              </Link>
              <ActionForm
                endpoint="/api/admin"
                payload={{ action: "resolve-change", id: change.id }}
                label="Promena je dogovorena i evidentirana"
              />
            </article>
          );
        })}
        {!changes.data?.length && <p>Nema zahteva za promenu.</p>}
      </section>
    </>
  );
}
