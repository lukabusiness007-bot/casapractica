import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeClient } from "@/lib/stripe";
import { db, configured } from "@/lib/supabase";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!configured() || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") || "",
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    const c = db();
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid")
        return NextResponse.json({ received: true });
      if (
        !session.metadata?.quote_id ||
        typeof session.payment_intent !== "string"
      )
        throw Error("Missing quote metadata");
      const { error } = await c.rpc("record_stripe_payment", {
        p_event_id: event.id,
        p_quote_id: session.metadata.quote_id,
        p_intent: session.payment_intent,
        p_amount: session.amount_total,
        p_currency: session.currency,
        p_session: session.id,
      });
      if (error) throw error;
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      if (typeof charge.payment_intent !== "string")
        throw Error("Missing payment intent");
      const { error } = await c.rpc("record_stripe_refund", {
        p_event_id: event.id,
        p_intent: charge.payment_intent,
        p_refunded: charge.amount_refunded,
      });
      if (error) throw error;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(
      "Stripe event processing failed",
      event.id,
      e instanceof Error ? e.message : "Database error",
    );
    return NextResponse.json({ error: "Retry event" }, { status: 500 });
  }
}
