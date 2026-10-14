import { test } from "node:test";
import assert from "node:assert/strict";
import { packageServiceId, services } from "../lib/catalog";
import { subscriptions, retiredSubscriptions } from "../lib/subscriptions";
import { commerceNote, commerceSchema } from "../lib/growth";
import { requestSchema } from "../lib/validation";
import { translator } from "../lib/i18n";
import { servicePricing } from "../lib/service-pricing";

test("monthly requests validate plan IDs and cannot supply their own price or attach a plan to a repair", () => {
  const contact = { name: "Ana", phone: "+381641234567", location: "Vračar" };
  const primary = services.find((service) => service.id === packageServiceId)!;
  for (const plan of subscriptions) {
    const commerce = commerceSchema.parse({ intent: "managed", subscription_id: plan.id });
    assert.ok(requestSchema.safeParse({ ...contact, service_id: primary.id, commerce }).success);
    const note = commerceNote(commerce, primary, services);
    assert.ok(note.includes(plan.name));
    assert.ok(note.includes((plan.price / 100).toFixed(2)));
    assert.ok(!requestSchema.safeParse({ ...contact, service_id: services[2].id, commerce }).success);
    assert.throws(() => commerceNote(commerce, services[2], services));
    assert.ok(!commerceSchema.safeParse({ intent: "managed", subscription_id: plan.id, price: 1 }).success);
  }
  assert.equal(subscriptions.length, 0);
  for (const archived of retiredSubscriptions) {
    assert.ok(!commerceSchema.safeParse({ intent: "managed", subscription_id: archived.id }).success);
    const pause = commerceSchema.parse({ intent: "plan-change", subscription_id: archived.id, plan_change: "pause" });
    assert.ok(commerceNote(pause, primary, services).includes(archived.name));
  }
  assert.ok(!commerceSchema.safeParse({ intent: "managed", subscription_id: "invented" }).success);
  assert.ok(!commerceSchema.safeParse({ intent: "service", subscription_id: "ritam" }).success);
  assert.ok(!commerceSchema.safeParse({ intent: "managed", subscription_id: "ritam", tier: "private" }).success);
});

test("monthly offer and price-scope copy is translated in every supported language", () => {
  for (const locale of ["en", "ru", "de", "tr", "zh"] as const) {
    const t = translator(locale);
    for (const plan of subscriptions)
      for (const copy of [plan.name, plan.description, plan.excludes, ...plan.includes])
        assert.notEqual(t(copy), copy, `${locale}: ${copy}`);
    for (const pricing of Object.values(servicePricing)) {
      assert.notEqual(t(pricing.scope), pricing.scope, `${locale}: ${pricing.scope}`);
      assert.notEqual(t(pricing.unit), pricing.unit, `${locale}: ${pricing.unit}`);
    }
  }
});
