import { resolveSiteUrl } from "@/lib/site-url";
import { locales, localePath } from "@/lib/i18n/routing";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, requireUser, failure, HttpError } from "@/lib/http";
import { db } from "@/lib/supabase";
import { stripeClient } from "@/lib/stripe";
import { clubReady } from "@/lib/club-server";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const u = await requireUser();
    if (!(await clubReady())) throw new HttpError(503, "Klupske cene i plaćanje trenutno nisu dostupni. Tim će potvrditi ponudu.");
    const parsed = z
      .object({
        quote_id: z.string().uuid(),
        locale: z.enum(locales).default("sr"),
      })
      .safeParse(await req.json());
    if (!parsed.success) throw new HttpError(400, "Neispravna ponuda.");
    const stripe = stripeClient();
    const c = db();
    const { data, error } = await c
      .rpc("begin_checkout", {
        p_quote_id: parsed.data.quote_id,
        p_user_id: u.id,
      })
      .single();
    if (error || !data)
      throw new HttpError(409, "Ponuda nije dostupna za plaćanje.");
    let quote = data as {
      id: string;
      checkout_session_id: string | null;
      checkout_generation: number;
      currency: string;
      total_amount: number;
      description: string;
    };
    if (quote.checkout_session_id) {
      const existing = await stripe.checkout.sessions.retrieve(
        quote.checkout_session_id,
      );
      if (existing.status === "open" && existing.url)
        return NextResponse.json({ url: existing.url });
      if (existing.status === "complete")
        throw new HttpError(
          409,
          "Uplata se obrađuje. Osvežite nalog za potvrdu.",
        );
      const retry = await c
        .rpc("retry_checkout", {
          p_quote_id: quote.id,
          p_old_session: quote.checkout_session_id,
        })
        .single();
      if (retry.error) throw retry.error;
      quote = retry.data as typeof quote;
    }
    const origin = resolveSiteUrl();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        allowed_payment_method_types: ["card"],
        customer_email: u.email,
        client_reference_id: quote.id,
        metadata: { quote_id: quote.id, user_id: u.id },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: quote.currency,
              unit_amount: quote.total_amount,
              product_data: {
                name: "casa practica — dogovorena usluga",
                description: quote.description,
              },
            },
          },
        ],
        success_url: `${origin}${localePath("/nalog", parsed.data.locale)}?payment=processing`,
        cancel_url: `${origin}${localePath("/nalog", parsed.data.locale)}?payment=cancelled`,
      },
      { idempotencyKey: `quote-${quote.id}-${quote.checkout_generation}` },
    );
    const result = await c
      .from("quotes")
      .update({ checkout_session_id: session.id })
      .eq("id", quote.id);
    if (result.error) throw result.error;
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return failure(e);
  }
}
