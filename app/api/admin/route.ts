import { NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, requireUser, failure, HttpError } from "@/lib/http";
import { db } from "@/lib/supabase";
import { finalAmount } from "@/lib/validation";
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
    .regex(/^(\/images\/[a-zA-Z0-9._-]+|https:\/\/[^\s]+)$/)
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
    } else if (body.action === "quote") {
      const parsed = z
        .object({
          request_id: z.string().uuid(),
          base_amount: z.coerce.number().positive().max(10000000),
          discount_amount: z.coerce.number().min(0).max(10000000),
          description: z.string().trim().min(5).max(1000),
        })
        .safeParse(body);
      if (!parsed.success)
        throw new HttpError(400, "Proverite iznose i opis ponude.");
      const d = parsed.data;
      const base = Math.round(d.base_amount * 100),
        discount = Math.round(d.discount_amount * 100);
      try {
        finalAmount(base, discount);
      } catch {
        throw new HttpError(400, "Popust mora biti manji od osnovnog iznosa.");
      }
      const { error } = await c.rpc("save_quote", {
        p_request_id: d.request_id,
        p_base: base,
        p_discount: discount,
        p_description: d.description,
      });
      if (error)
        throw new HttpError(
          409,
          "Ponuda je zaključana, zahtev je zatvoren ili korisnica nema članstvo za navedeni popust.",
        );
    } else throw new HttpError(400, "Nepoznata radnja.");
    return NextResponse.json({ message: "Izmene su sačuvane." });
  } catch (e) {
    return failure(e);
  }
}
