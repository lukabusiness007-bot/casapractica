import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  classifyAttribution,
  publicLandingPath,
  attributionSchema,
  sourceReport,
} from "../lib/attribution";
import { businessDetails } from "../lib/business";
import { publicPageMetadata } from "../lib/seo";
import { guides } from "../lib/guides";
import { seoCopy } from "../lib/seo-copy";
import { locales } from "../lib/i18n/routing";
import { eventSchema } from "../lib/growth";

test("source grouping strips query data, excludes private paths and distinguishes organic and paid", () => {
  const organic = classifyAttribution(
    "https://www.casapractica.rs/en/paketi?email=private@example.com#person",
    "https://www.google.rs/search?q=private",
  );
  assert.deepEqual(organic, {
    source: "google",
    medium: "organic",
    landing_path: "/en/paketi",
    locale: "en",
  });
  assert.equal(
    classifyAttribution("https://www.casapractica.rs/?gclid=private-click", "")
      .medium,
    "paid",
  );
  assert.equal(
    classifyAttribution(
      "https://www.casapractica.rs/?utm_source=instagram&utm_medium=paid-social",
      "",
    ).source,
    "social",
  );
  assert.equal(
    classifyAttribution(
      "https://www.casapractica.rs/paketi",
      "https://casapractica.rs/",
    ).source,
    "direct",
  );
  assert.equal(
    classifyAttribution(
      "https://www.casapractica.rs/paketi",
      "https://google.evil.test/",
    ).source,
    "referral",
  );
  assert.equal(
    classifyAttribution(
      "https://www.casapractica.rs/?utm_source=google&utm_medium=email",
      "",
    ).medium,
    "other",
  );
  assert.equal(
    classifyAttribution(
      "https://www.casapractica.rs/?utm_source=instagram&utm_medium=paid_social",
      "https://www.google.com/",
    ).source,
    "social",
  );
  assert.equal(publicLandingPath("/nalog/private-person"), "/");
  assert.equal(publicLandingPath("/usluge/private-email"), "/");
  assert.ok(
    !attributionSchema.safeParse({
      ...organic,
      landing_path: "/paketi?phone=123",
    }).success,
  );
  assert.ok(
    !attributionSchema.safeParse({
      ...organic,
      referrer: "https://example.com/private",
    }).success,
  );
  const event = {
    event_id: crypto.randomUUID(),
    session_id: crypto.randomUUID(),
    event_name: "page_view",
    context: "guides",
    attribution: organic,
  };
  assert.ok(eventSchema.safeParse(event).success);
  assert.ok(
    !eventSchema.safeParse({
      ...event,
      attribution: { ...organic, source: "private@example.com" },
    }).success,
  );
});

test("source reports count real regular enquiries without claiming every request is a monthly contract", () => {
  const attribution = classifyAttribution(
    "https://www.casapractica.rs/paketi",
    "https://www.google.com/",
  );
  const rows = sourceReport([
    {
      attribution,
      analytics_session_id: "session",
      commerce: { cadence: "weekly" },
      status: "received",
    },
    {
      attribution,
      analytics_session_id: "session",
      commerce: { plan_frequency: "mixed" },
      status: "scheduled",
    },
    {
      attribution,
      analytics_session_id: "session",
      commerce: { intent: "service" },
      status: "completed",
    },
    { attribution, commerce: { tier: "private" }, status: "completed" },
    { status: "received" },
  ]);
  assert.deepEqual(rows, [
    { source: "google", medium: "organic", leads: 3, regular: 2, confirmed: 1 },
  ]);
});

test("analytics persists and sends nothing without consent and preserves the first public landing page", async () => {
  const local = new Map<string, string>(),
    session = new Map<string, string>();
  const storage = (values: Map<string, string>) => ({
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  const keys = [
    "window",
    "document",
    "localStorage",
    "sessionStorage",
    "fetch",
  ] as const;
  const old = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  let sent = 0;
  try {
    Object.defineProperties(globalThis, {
      window: {
        configurable: true,
        value: {
          location: {
            href: "https://www.casapractica.rs/en/paketi?email=private@example.com",
          },
        },
      },
      document: {
        configurable: true,
        value: { referrer: "https://www.google.com/search?q=private" },
      },
      localStorage: { configurable: true, value: storage(local) },
      sessionStorage: { configurable: true, value: storage(session) },
      fetch: {
        configurable: true,
        value: async () => {
          sent++;
          return new Response(null, { status: 204 });
        },
      },
    });
    const client = await import("../lib/analytics-client");
    client.clearAttribution();
    client.rememberLanding();
    client.track("page_view", "plans");
    assert.equal(client.analyticsAttribution(), undefined);
    assert.equal(session.size, 0);
    assert.equal(sent, 0);
    local.set("casa-analytics", "yes");
    window.location.href = "https://www.casapractica.rs/konsultacije";
    const first = client.analyticsAttribution();
    assert.equal(first?.landing_path, "/en/paketi");
    client.track("lead_start", "consultation");
    assert.equal(sent, 1);
    assert.ok(!JSON.stringify([...session]).includes("private"));
    local.set("casa-analytics", "no");
    client.clearAttribution();
    session.delete("casa-session");
    client.track("lead_submit", "consultation");
    assert.equal(sent, 1);
    assert.equal(session.size, 0);
  } finally {
    for (const key of keys) {
      const value = old.get(key);
      if (value) Object.defineProperty(globalThis, key, value);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});

test("contact placeholders never become live phone or email links, while real configured contacts work", () => {
  const empty = businessDetails({
    BUSINESS_PHONE: "+381 6X XXX XXXX",
    BUSINESS_EMAIL: "not-an-email",
  });
  assert.equal(empty.phoneHref, null);
  assert.equal(empty.email, "");
  assert.equal(empty.whatsappHref, null);
  const contact = businessDetails({
    BUSINESS_PHONE: "+381 64 1234567",
    BUSINESS_EMAIL: "office@example.com",
    WHATSAPP_NUMBER: "381641234567",
  });
  assert.equal(contact.phoneHref, "tel:+381641234567");
  assert.equal(contact.whatsappHref, "https://wa.me/381641234567");
});

test("guides have distinct localized titles, public canonicals and a path to the recurring offer", () => {
  for (const locale of locales) {
    const entries = guides(locale);
    assert.equal(entries.length, 4);
    assert.equal(new Set(entries.map((item) => item.title)).size, 4);
    for (const guide of entries) {
      assert.equal(guide.sections.length, 3);
      assert.ok(
        guide.sections.every(([heading, text]) => heading && text.length > 100),
      );
      if (locale !== "sr")
        assert.notEqual(
          guide.title,
          guides("sr").find((item) => item.slug === guide.slug)?.title,
        );
      assert.equal(
        publicLandingPath(
          `${locale === "sr" ? "" : `/${locale}`}/saveti/${guide.slug}`,
        ),
        `${locale === "sr" ? "" : `/${locale}`}/saveti/${guide.slug}`,
      );
    }
    assert.notEqual(
      publicPageMetadata(locale, "/").description,
      publicPageMetadata(locale, "/usluge").description,
    );
    assert.ok(seoCopy(locale).plansTitle.length > 10);
  }
});

test("attribution migration is repeatable and preserves old requests and table permissions", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create table requests(id integer primary key); create table analytics_events(event_id integer primary key); insert into requests values(1); alter table requests enable row level security; alter table analytics_events enable row level security;",
    );
    const sql = await readFile(
      "supabase/migrations/010_seo_attribution.sql",
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    assert.deepEqual((await db.query("select * from requests")).rows, [
      { id: 1, attribution: null },
    ]);
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select attribution from requests"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
