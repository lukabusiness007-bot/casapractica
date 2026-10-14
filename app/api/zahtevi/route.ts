import { isLocale } from "@/lib/i18n/routing";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { assertOrigin, assertReady, failure, HttpError } from "@/lib/http";
import { db, currentUser } from "@/lib/supabase";
import { requestSchema, whatsappLink } from "@/lib/validation";
import { packageRequestNote } from "@/lib/packages";
import { growthReady, attributionReady } from "@/lib/data";
import { commerceNote } from "@/lib/growth";
import { publicService } from "@/lib/catalog";
import { isPublishedService } from "@/lib/service-availability";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    assertReady();
    if (!(await growthReady()))
      throw new HttpError(503, "Dodatne mogućnosti trenutno nisu dostupne.");
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
    const { data: storedService } = await client
      .from("services")
      .select("*")
      .eq("id", input.service_id)
      .eq("active", true)
      .single();
    if (!storedService || !isPublishedService(storedService))
      throw new HttpError(404, "Usluga nije dostupna.");
    const service = publicService(storedService);
    const ip =
      req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "local";
    const hash = (s: string) => createHash("sha256").update(s).digest("hex");
    const limits: [string, number][] = [
      [`ip:${hash(ip)}`, 15],
      [`phone:${hash(input.phone.replace(/\D/g, ""))}`, 5],
    ];
    if (input.email) limits.push([`email:${hash(input.email)}`, 5]);
    for (const [key, limit] of limits) {
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
      user?.email_confirmed_at &&
      (!input.email || user.email?.toLowerCase() === input.email)
        ? user.id
        : null;
    const { website: _, package: selection, attribution, ...record } = input;
    // Plan frequency is computed from validated selections, not claimed by the client.
    if (record.commerce) delete record.commerce.plan_frequency;
    void _;
    if (input.commerce?.referral_code) {
      const { data: referral, error: referralError } = await client
        .from("referral_codes")
        .select("user_id")
        .eq("code", input.commerce.referral_code)
        .eq("active", true)
        .maybeSingle();
      if (referralError) throw referralError;
      if (!referral || referral.user_id === user?.id)
        delete record.commerce!.referral_code;
    }
    if (input.commerce) {
      const { data: available, error: catalogError } = await client
        .from("services")
        .select("*")
        .eq("active", true);
      if (catalogError) throw catalogError;
      try {
        const summary = commerceNote(
          input.commerce,
          service,
          (available || []).filter(isPublishedService).map(publicService),
        );
        record.note = [summary, record.note].filter(Boolean).join("\n\n");
      } catch {
        throw new HttpError(400, "Proverite izbor dopuna.");
      }
    }
    if (selection) {
      const { data: selectedServices, error: selectionError } = await client
        .from("services")
        .select("id,name,slug,active")
        .in(
          "id",
          selection.items.map((item) => item.service_id),
        )
        .eq("active", true);
      if (selectionError) throw selectionError;
      try {
        record.note = packageRequestNote(
          selection,
          (selectedServices || []).filter(isPublishedService),
          record.note,
        );
      } catch {
        throw new HttpError(400, "Proverite izbor usluga u paketu.");
      }
      const regular = [
        ...new Set(
          selection.items
            .map((item) => item.frequency)
            .filter((frequency) =>
              ["monthly", "twice-monthly", "weekly"].includes(frequency),
            ),
        ),
      ];
      if (regular.length && record.commerce)
        record.commerce.plan_frequency =
          regular.length > 1
            ? "mixed"
            : (regular[0] as "monthly" | "twice-monthly" | "weekly");
    }
    const { data, error } = await client
      .from("requests")
      .insert({
        ...record,
        ...((await attributionReady()) &&
        input.analytics_session_id &&
        attribution
          ? { attribution }
          : {}),
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
