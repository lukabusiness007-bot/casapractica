import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { services, packageServiceId } from "../lib/catalog";
import {
  commerceSchema,
  commerceNote,
  eventSchema,
  collections,
} from "../lib/growth";
import { requestSchema } from "../lib/validation";
import { homeProfileSchema } from "../lib/home-profile";
import { customerMetrics } from "../lib/customer-metrics";

test("short contacts allow optional email and managed plans while keeping package and contact safeguards", () => {
  const contact = {
    service_id: services[2].id,
    name: "Ana",
    phone: "+381641234567",
    location: "Vračar",
  };
  assert.equal(requestSchema.parse(contact).email, null);
  assert.equal(requestSchema.parse({ ...contact, email: "" }).email, null);
  assert.ok(!requestSchema.safeParse({ ...contact, email: "broken" }).success);
  assert.ok(!requestSchema.safeParse({ ...contact, website: "spam" }).success);
  assert.ok(
    requestSchema.safeParse({
      ...contact,
      service_id: packageServiceId,
      commerce: { intent: "managed", tier: "private" },
    }).success,
  );
  assert.ok(
    !requestSchema.safeParse({ ...contact, service_id: packageServiceId })
      .success,
  );
  assert.ok(
    !requestSchema.safeParse({
      ...contact,
      commerce: { intent: "plan-change" },
    }).success,
  );
  assert.ok(
    requestSchema.safeParse({
      ...contact,
      service_id: packageServiceId,
      commerce: { intent: "plan-change", plan_change: "pause" },
    }).success,
  );
  assert.ok(!commerceSchema.safeParse({ follow_up_opt_in: "false" }).success);
  const parsed = requestSchema.parse({
    ...contact,
    direct_cost: 1,
    satisfaction_score: 5,
    user_id: "evil",
  });
  assert.ok(!("direct_cost" in parsed) && !("user_id" in parsed));
});
test("upsells use active server names and cannot add unrelated or unavailable work", () => {
  const tv = services[2],
    sound = services.find((service) => service.slug === "podesavanje-tv-a")!;
  const context = commerceSchema.parse({
    additional_service_ids: [sound.id],
    upgrade_ids: ["hidden-cables"],
  });
  assert.match(commerceNote(context, tv, services), /Skrivanje kablova/);
  assert.match(
    commerceNote(
      context,
      tv,
      services.map((service) => ({ ...service, name: "Current catalog name" })),
    ),
    /Current catalog name/,
  );
  assert.throws(() =>
    commerceNote(
      context,
      tv,
      services.map((service) => ({
        ...service,
        active: service.id !== sound.id,
      })),
    ),
  );
  assert.throws(() =>
    commerceNote(
      commerceSchema.parse({ additional_service_ids: [services[0].id] }),
      tv,
      services,
    ),
  );
  assert.throws(() => commerceNote(context, services[0], services));
  for (const collection of collections)
    assert.ok(
      collection.slugs.every((slug) =>
        services.some((service) => service.slug === slug),
      ),
    );
});
test("analytics rejects PII and home profiles reject invalid dates and excessive detail", () => {
  const event = {
    event_id: crypto.randomUUID(),
    session_id: crypto.randomUUID(),
    event_name: "page_view",
    context: "home",
  };
  assert.ok(eventSchema.safeParse(event).success);
  assert.ok(
    !eventSchema.safeParse({ ...event, email: "person@example.com" }).success,
  );
  assert.ok(
    !eventSchema.safeParse({
      ...event,
      context: "/konsultacije?phone=12345678",
    }).success,
  );
  assert.ok(
    !eventSchema.safeParse({ ...event, event_name: "payment_success" }).success,
  );
  const home = {
    label: "Moj dom",
    location: "Beograd",
    property_type: "apartment",
    maintenance_due: "2026-11-01",
  };
  assert.ok(homeProfileSchema.safeParse(home).success);
  assert.ok(
    !homeProfileSchema.safeParse({ ...home, maintenance_due: "2026-02-30" })
      .success,
  );
  assert.ok(
    !homeProfileSchema.safeParse({ ...home, preferences: "x".repeat(1501) })
      .success,
  );
});
test("realized value, refunds, cost coverage and mature repeat cohorts use paid data", () => {
  const requests = [
    {
      id: "a",
      name: "Ana",
      phone: "+381 64 1234567",
      created_at: "2026-01-01",
      direct_cost: 2000,
    },
    {
      id: "b",
      name: "Ana",
      phone: "+381641234567",
      created_at: "2026-01-20",
      direct_cost: null,
    },
    {
      id: "c",
      name: "Other",
      phone: "555555555",
      created_at: "2026-09-20",
      direct_cost: 1000,
    },
    {
      id: "d",
      name: "Refunded",
      phone: "999999999",
      created_at: "2026-01-01",
      direct_cost: 1,
    },
  ];
  const quotes = requests.map((request) => ({
    id: `q${request.id}`,
    request_id: request.id,
  }));
  const payments = [
    {
      quote_id: "qa",
      amount: 10000,
      refunded_amount: 1000,
      created_at: "2026-01-01",
    },
    {
      quote_id: "qb",
      amount: 20000,
      refunded_amount: 0,
      created_at: "2026-01-20",
    },
    {
      quote_id: "qc",
      amount: 5000,
      refunded_amount: 0,
      created_at: "2026-09-20",
    },
    {
      quote_id: "qd",
      amount: 9000,
      refunded_amount: 9000,
      created_at: "2026-01-01",
    },
  ];
  const result = customerMetrics(
    requests,
    quotes,
    payments,
    new Date("2026-10-12"),
  );
  assert.equal(result.revenue, 34000);
  assert.equal(result.orders, 3);
  assert.equal(result.contacts, 2);
  assert.equal(result.realizedValue, 17000);
  assert.equal(result.costCoverage, 3);
  assert.equal(result.contribution, 10999);
  assert.deepEqual(
    result.cohort.map((cohort) => [cohort.eligible, cohort.repeated]),
    [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
  );
  assert.equal(customerMetrics([], [], []).averageOrder, null);
});
test("growth migration preserves old requests, isolates home data, scopes analytics and schedules only opted-in follow-ups", async () => {
  const database = new PGlite();
  const a = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    b = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  try {
    await database.exec(
      "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;",
    );
    for (const file of [
      "001_initial.sql",
      "002_premium_catalog.sql",
      "003_growth.sql",
    ])
      await database.exec(
        (await readFile(`supabase/migrations/${file}`, "utf8")).replace(
          "create extension if not exists pgcrypto;",
          "",
        ),
      );
    await database.query(
      "insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,'a@example.com',now(),'{}'),($2,'b@example.com',now(),'{}')",
      [a, b],
    );
    const home = (
      await database.query<{ id: string }>(
        "insert into public.home_profiles(user_id,label,location) values($1,'Private home','Beograd') returning id",
        [a],
      )
    ).rows[0];
    await database.exec(
      `set role authenticated;select set_config('test.uid','${b}',false)`,
    );
    assert.equal(
      (
        await database.query<{ id: string }>(
          "select * from public.home_profiles",
        )
      ).rows.length,
      0,
    );
    await assert.rejects(
      database.query("update public.home_profiles set preferences='evil'"),
    );
    await database.exec("reset role");
    const opted = (
      await database.query<{ id: string }>(
        "insert into public.requests(service_id,name,email,phone,location,commerce) values($1,'Ana',null,'123456789','Beograd','{\"follow_up_opt_in\":true}') returning id",
        [services[2].id],
      )
    ).rows[0];
    const other = (
      await database.query<{ id: string }>(
        "insert into public.requests(service_id,name,email,phone,location) values($1,'Other',null,'987654321','Beograd') returning id",
        [services[2].id],
      )
    ).rows[0];
    await database.query("select public.update_request($1,'completed',null)", [
      opted.id,
    ]);
    await database.query("select public.update_request($1,'completed',null)", [
      other.id,
    ]);
    const rows = (
      await database.query<{
        id: string;
        completed_at: Date;
        follow_up_at: string | null;
      }>("select id,completed_at,follow_up_at from public.requests")
    ).rows;
    assert.ok(rows.find((row) => row.id === opted.id)?.follow_up_at);
    assert.equal(rows.find((row) => row.id === other.id)?.follow_up_at, null);
    assert.ok(rows.every((row) => row.completed_at));
    await database.query(
      "insert into public.analytics_events(event_id,session_id,event_name,context) values($1,$2,'page_view','home')",
      [crypto.randomUUID(), crypto.randomUUID()],
    );
    await database.exec(
      `set role authenticated;select set_config('test.uid','${a}',false)`,
    );
    assert.equal(
      (await database.query("select * from public.analytics_events")).rows
        .length,
      0,
    );
    assert.equal(
      (
        await database.query<{ id: string }>(
          "select * from public.home_profiles",
        )
      ).rows[0].id,
      home.id,
    );
    await database.query("select public.claim_my_requests()");
    await database.exec("reset role");
    assert.ok(
      (
        await database.query<{ user_id: string | null }>(
          "select user_id from public.requests",
        )
      ).rows.every((row) => row.user_id === null),
    );
    await database.query("insert into public.admins values($1)", [b]);
    await database.exec(
      `set role authenticated;select set_config('test.uid','${b}',false)`,
    );
    assert.equal(
      (await database.query("select * from public.analytics_events")).rows
        .length,
      1,
    );
    assert.equal(
      (
        await database.query<{ id: string }>(
          "select * from public.home_profiles",
        )
      ).rows.length,
      1,
    );
    await database.exec("reset role;set role anon");
    await assert.rejects(
      database.query<{ id: string }>("select * from public.home_profiles"),
    );
    await assert.rejects(
      database.query("select * from public.analytics_events"),
    );
  } finally {
    await database.close();
  }
});
