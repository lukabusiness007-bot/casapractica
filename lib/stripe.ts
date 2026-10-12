import "server-only";
import Stripe from "stripe";
import { HttpError } from "./http";
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(503, "Online plaćanje još nije aktivirano.");
  if (
    key.startsWith("sk_live_") &&
    process.env.PAYMENTS_LIVE_ENABLED !== "true"
  )
    throw new HttpError(503, "Stvarna naplata još nije aktivirana.");
  return new Stripe(key);
}
