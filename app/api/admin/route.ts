import { NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, requireUser, failure, HttpError } from "@/lib/http";
import { db } from "@/lib/supabase";
import { clubReady } from "@/lib/club-server";
const nullableMoney = z.preprocess(
  (v) => (v === "" || v == null ? null : Math.round(Number(v) * 100)),
  z.number().int().positive().nullable(),
);
const service = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  name: z.string().trim().min(2).max(100),
  tagline: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(3000),
  image: z
    .string()
    .regex(/^(\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9]+)?|https:\/\/[^\s]+)$/)
    .max(1000),
  price: nullableMoney,
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
  sort_order: z.coerce.number().int().min(0).max(1000),
});
const benefit = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(5).max(3000),
  discount_percent: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(1).max(100).nullable(),
  ),
  member_at: z.string().datetime({ offset: true }),
  public_at: z.string().datetime({ offset: true }).nullable(),
  ends_at: z.string().datetime({ offset: true }).nullable(),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    await requireUser(true);
    const body = await req.json();
    const c = db();
    if (body.action === "service") {
      const parsed = service.safeParse(body);
      if (!parsed.success)
        throw new HttpError(
          400,
          "Proverite naziv, opis, sliku, cenu i URL oznaku usluge.",
        );
      const { error } = await c.from("services").upsert(parsed.data);
      if (error)
        throw new HttpError(
          400,
          "Usluga nije sačuvana. Proverite da li je URL oznaka jedinstvena.",
        );
    } else if (body.action === "benefit") {
      const parsed = benefit.safeParse(body);
      if (!parsed.success)
        throw new HttpError(
          400,
          "Proverite podatke i unesite datume u ISO formatu sa vremenskom zonom.",
        );
      const d = parsed.data;
      if (
        (d.public_at && Date.parse(d.public_at) < Date.parse(d.member_at)) ||
        (d.ends_at && Date.parse(d.ends_at) <= Date.parse(d.member_at))
      )
        throw new HttpError(400, "Proverite redosled datuma.");
      const { error } = await c.from("benefits").upsert(d);
      if (error) throw error;
    } else if (body.action === "request") {
      const parsed = z
        .object({
          id: z.string().uuid(),
          status: z.enum([
            "received",
            "discussing",
            "quoted",
            "scheduled",
            "completed",
            "cancelled",
          ]),
          appointment_at: z.string().datetime({ offset: true }).nullable(),
        })
        .safeParse(body);
      if (!parsed.success)
        throw new HttpError(
          400,
          "Proverite status i termin (ISO datum sa vremenskom zonom).",
        );
      const { error } = await c.rpc("update_request", {
        p_id: parsed.data.id,
        p_status: parsed.data.status,
        p_appointment: parsed.data.appointment_at,
      });
      if (error)
        throw new HttpError(
          409,
          "Promena nije moguća. Za zakazivanje unesite termin; za ponudu prvo sačuvajte iznos. Otkazivanje zaključane naplate zahteva obradu u Stripe-u.",
        );
    } else if (body.action === "follow-up-done") {
      const input = z.object({ id: z.string().uuid() }).safeParse(body);
      if (!input.success)
        throw new HttpError(400, "Proverite podatke za praćenje.");
      const { error } = await c
        .from("requests")
        .update({ follow_up_state: "done" })
        .eq("id", input.data.id);
      if (error) throw error;
    } else if (body.action === "operations") {
      const input = z
        .object({
          id: z.string().uuid(),
          email: z.preprocess(
            (v) => (v === "" || v == null ? null : v),
            z
              .string()
              .trim()
              .email()
              .max(254)
              .transform((v) => v.toLowerCase())
              .nullable(),
          ),
          direct_cost: z.preprocess(
            (v) => (v === "" || v == null ? null : Math.round(Number(v) * 100)),
            z.number().int().min(0).max(1000000000).nullable(),
          ),
          satisfaction_score: z.preprocess(
            (v) => (v === "" || v == null ? null : Number(v)),
            z.number().int().min(1).max(5).nullable(),
          ),
          follow_up_at: z.preprocess(
            (v) => (v === "" || v == null ? null : v),
            z.iso.date().nullable(),
          ),
          follow_up_state: z.enum(["todo", "done", "cancelled"]),
          follow_up_kind: z.enum([
            "satisfaction",
            "plan",
            "seasonal",
            "referral",
            "retention",
          ]),
        })
        .safeParse(body);
      if (!input.success)
        throw new HttpError(400, "Proverite podatke za praćenje.");
      const { id, ...record } = input.data;
      const { data: request, error: readError } = await c
        .from("requests")
        .select("user_id,email,status")
        .eq("id", id)
        .maybeSingle();
      if (readError) throw readError;
      if (!request) throw new HttpError(404, "Zahtev nije pronađen.");
      if (request.user_id && request.email && request.email !== record.email)
        throw new HttpError(
          409,
          "Email povezanog zahteva ne može da se promeni.",
        );
      if (record.satisfaction_score !== null && request.status !== "completed")
        throw new HttpError(409, "Ocena je dostupna nakon završene posete.");
      const { error } = await c.from("requests").update(record).eq("id", id);
      if (error) throw error;
    } else if (body.action === "showcase") {
      const input = z
        .object({
          id: z.string().uuid().optional(),
          kind: z.enum(["team", "work"]),
          title: z.string().trim().min(2).max(100),
          description: z.string().trim().min(10).max(2000),
          image: z.preprocess(
            (v) => (v === "" || v == null ? null : v),
            z
              .string()
              .regex(/^(\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9]+)?|https:\/\/[^\s]+)$/)
              .max(1000)
              .nullable(),
          ),
          active: z.enum(["true", "false"]).transform((v) => v === "true"),
        })
        .safeParse(body);
      if (!input.success)
        throw new HttpError(400, "Proverite podatke za prikaz.");
      const { error } = await c.from("showcase").upsert(input.data);
      if (error) throw error;
    } else if (body.action === "quote") {
      if (!(await clubReady())) throw new HttpError(503, "Za klupske cene primenite migraciju 009_club_conversion.sql.");
      const parsed = z.object({ request_id: z.string().uuid(), description: z.string().trim().min(5).max(1000), items: z.array(z.object({ label: z.string().trim().min(2).max(200), amount: z.coerce.number().positive().max(10000000), kind: z.enum(["primary", "addon", "upgrade", "travel", "material"]) }).strict()).min(1).max(12) }).safeParse(body);
      if (!parsed.success) throw new HttpError(400, "Proverite stavke, iznose i opis ponude.");
      const items = parsed.data.items.map((item) => ({ ...item, amount: Math.round(item.amount * 100) }));
      if (items.some((item) => item.amount <= 0) || items.reduce((sum, item) => sum + item.amount, 0) > 1000000000) throw new HttpError(400, "Proverite iznose stavki.");
      const { error } = await c.rpc("save_itemized_quote", { p_request_id: parsed.data.request_id, p_items: items, p_description: parsed.data.description });
      if (error) throw new HttpError(409, "Ponuda je zaključana ili je zahtev zatvoren. Klupski popust i kredit obračunavaju se automatski.");
    } else if (body.action === "approve-referral") {
      const parsed = z.object({ request_id: z.string().uuid() }).safeParse(body);
      if (!parsed.success) throw new HttpError(400, "Proverite preporuku.");
      const { error } = await c.rpc("approve_referral", { p_request_id: parsed.data.request_id });
      if (error) throw new HttpError(409, "Proverite prvi izvršen i neto plaćen posao od 10.000 RSD, članstvo obe osobe i mesečni limit kredita.");
    } else if (body.action === "resolve-change") {
      const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
      if (!parsed.success) throw new HttpError(400, "Proverite zahtev za promenu.");
      const { error } = await c.from("visit_changes").update({ status: "resolved" }).eq("id", parsed.data.id);
      if (error) throw error;
    } else throw new HttpError(400, "Nepoznata radnja.");
    return NextResponse.json({ message: "Izmene su sačuvane." });
  } catch (e) {
    return failure(e);
  }
}
