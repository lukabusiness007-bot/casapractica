import { test } from "node:test";
import assert from "node:assert/strict";
import {
  requestSchema,
  finalAmount,
  safeReturn,
  whatsappLink,
} from "../lib/validation";
test("requests validate contact details and normalize email without accepting spam", () => {
  const good = {
    service_id: "11111111-1111-4111-8111-111111111111",
    name: "Ana Ana",
    email: "Ana@Example.com",
    phone: "+381 64 1234567",
    location: "Vračar, Beograd",
  };
  assert.equal(requestSchema.parse(good).email, "ana@example.com");
  assert.equal(
    requestSchema.safeParse({ ...good, website: "spam" }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...good, phone: "abc" }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...good, email: "invalid" }).success,
    false,
  );
});
test("amounts remain integer minor units and reject invalid discounts", () => {
  assert.equal(finalAmount(120000, 20000), 100000);
  for (const [base, discount] of [
    [0, 0],
    [100, 100],
    [100, -1],
    [100.5, 0],
    [Number.MAX_SAFE_INTEGER + 1, 0],
  ])
    assert.throws(() => finalAmount(base, discount));
});
test("return paths cannot redirect to external sites", () => {
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    null,
  ])
    assert.equal(safeReturn(value), "/nalog");
  assert.equal(safeReturn("/auth/oporavak"), "/auth/oporavak");
});
test("WhatsApp stays inactive without a valid number and contains only reference details", () => {
  assert.equal(whatsappLink("", "Pranje tepiha", "PZ-123"), null);
  const url = new URL(whatsappLink("381641234567", "Pranje tepiha", "PZ-123")!);
  assert.equal(url.hostname, "wa.me");
  assert.match(url.searchParams.get("text")!, /PZ-123/);
  assert.match(url.searchParams.get("text")!, /Pranje tepiha/);
});
