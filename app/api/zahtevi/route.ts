import { isLocale } from "@/lib/i18n/routing";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { assertOrigin, assertReady, failure, HttpError } from "@/lib/http";
import { db, currentUser } from "@/lib/supabase";
import { requestSchema, whatsappLink } from "@/lib/validation";
import { packageRequestNote } from "@/lib/packages";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    assertReady();
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success)
      throw new HttpError(
        400,
        "Proverite kontakt podatke i popunite obavezna polja.",
      );
    const input = parsed.data;
    if (
      input.desired_at &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(input.desired_at) ||
        !Number.isFinite(Date.parse(input.desired_at)) ||
        input.desired_at < new Date().toISOString().slice(0, 10))
    )
      throw new HttpError(400, "Izaberite današnji ili budući datum.");
    const client = db();
    const { data: service } = await client
      .from("services")
      .select("id,name")
      .eq("id", input.service_id)
      .eq("active", true)
      .single();
    if (!service) throw new HttpError(404, "Usluga nije dostupna.");
    const ip =
      req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "local";
    const hash = (s: string) => createHash("sha256").update(s).digest("hex");
    for (const [key, limit] of [
      [`ip:${hash(ip)}`, 15],
      [`email:${hash(input.email)}`, 5],
    ] as const) {
      const { data, error } = await client.rpc("consume_rate_limit", {
        p_key: key,
        p_limit: limit,
      });
      if (error) throw error;
      if (!data)
        throw new HttpError(
          429,
          "Dostignut je broj zahteva. Pokušajte ponovo kasnije.",
        );
    }
    const user = await currentUser();
    const userId =
      user?.email_confirmed_at && user.email?.toLowerCase() === input.email
        ? user.id
        : null;
    const { website: _, package: selection, ...record } = input;
    void _;
    if (selection) {
      const { data: selectedServices, error: selectionError } = await client
        .from("services")
        .select("id,name")
        .in(
          "id",
          selection.items.map((item) => item.service_id),
        )
        .eq("active", true);
      if (selectionError) throw selectionError;
      try {
        record.note = packageRequestNote(
          selection,
          selectedServices || [],
          record.note,
        );
      } catch {
        throw new HttpError(400, "Proverite izbor usluga u paketu.");
      }
    }
    const { data, error } = await client
      .from("requests")
      .insert({
        ...record,
        desired_at: input.desired_at || null,
        user_id: userId,
      })
      .select("reference")
      .single();
    if (error) throw error;
    const requestedLanguage = req.headers.get("accept-language") || "sr";
    const locale = isLocale(requestedLanguage) ? requestedLanguage : "sr";
    return NextResponse.json(
      {
        reference: data.reference,
        whatsapp: whatsappLink(
          process.env.WHATSAPP_NUMBER || "",
          service.name,
          data.reference,
          locale,
        ),
      },
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
