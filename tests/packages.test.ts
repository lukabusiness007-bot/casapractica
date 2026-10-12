import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { servicePricing } from "../lib/service-pricing";
import { additionalServices } from "../lib/catalog-additions";
import { packageServiceId, services } from "../lib/catalog";
import { packageSchema, packageRequestNote } from "../lib/packages";
import { requestSchema } from "../lib/validation";

const selection = {
  plan_id: "custom" as const,
  items: [
    { service_id: services[2].id, frequency: "once" as const },
    {
      service_id: services.find((service) => service.slug === "nega-garderobe")!
        .id,
      frequency: "weekly" as const,
    },
  ],
};
const contact = {
  name: "Ana",
  email: "ana@example.com",
  phone: "+381641234567",
  location: "Vračar, Beograd",
};

test("package requests require a valid selection only for the package service", () => {
  assert.ok(
    requestSchema.safeParse({
      ...contact,
      service_id: packageServiceId,
      package: selection,
    }).success,
  );
  assert.ok(
    requestSchema.safeParse({ ...contact, service_id: services[0].id }).success,
  );
  assert.ok(
    !requestSchema.safeParse({ ...contact, service_id: packageServiceId })
      .success,
  );
  assert.ok(
    !requestSchema.safeParse({
      ...contact,
      service_id: services[0].id,
      package: selection,
    }).success,
  );
  assert.ok(!packageSchema.safeParse({ ...selection, items: [] }).success);
  assert.ok(
    !packageSchema.safeParse({
      ...selection,
      items: [selection.items[0], selection.items[0]],
    }).success,
  );
  assert.ok(
    !packageSchema.safeParse({
      ...selection,
      items: [{ service_id: packageServiceId, frequency: "once" }],
    }).success,
  );
  assert.ok(
    !packageSchema.safeParse({
      ...selection,
      items: services
        .slice(0, 13)
        .map((service) => ({ service_id: service.id, frequency: "once" })),
    }).success,
  );
  assert.ok(!packageSchema.safeParse({ ...selection, price: 1 }).success);
  assert.ok(
    !packageSchema.safeParse({
      ...selection,
      items: [{ ...selection.items[0], name: "Fake service" }],
    }).success,
  );
  assert.ok(
    !packageSchema.safeParse({
      ...selection,
      items: [{ ...selection.items[0], frequency: "daily" }],
    }).success,
  );
});

test("package summaries use current server catalog names and reject unavailable selections", () => {
  const summary = packageRequestNote(
    selection,
    services,
    "Dve košulje i TV od 55 inča.",
  );
  assert.match(summary, /Casa plan: Moja Casa/);
  assert.match(summary, /Montaža TV-a — Jednokratno/);
  assert.match(summary, /Nega garderobe — Svake nedelje/);
  assert.match(summary, /Dve košulje/);
  assert.throws(() =>
    packageRequestNote(
      selection,
      services.filter(
        (service) => service.id !== selection.items[0].service_id,
      ),
      "",
    ),
  );
  assert.match(
    packageRequestNote(
      selection,
      services.map((service) => ({ ...service, name: "Admin updated name" })),
      "",
    ),
    /Admin updated name/,
  );
});

test("catalog migrations preserve existing requests, prices and admin edits and are repeatable", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql as $$ select null::uuid $$;",
    );
    await db.exec(
      (await readFile("supabase/migrations/001_initial.sql", "utf8")).replace(
        "create extension if not exists pgcrypto;",
        "",
      ),
    );
    await db.query(
      "insert into public.services(id,slug,name,tagline,description,image,price,active) values ($1,'pranje-tepiha','Admin name','Admin tagline','Admin description','/images/carpet.jpg',450000,false)",
      [services[0].id],
    );
    await db.query(
      "insert into public.requests(service_id,name,email,phone,location) values ($1,'Ana','ana@example.com','123456789','Beograd')",
      [services[0].id],
    );
    await db.query(
      "insert into public.services(id,slug,name,tagline,description,image,price) values ($1,'ugradnja-tv-a','Ugradnja TV-a','Vaše malo kućno bioskopsko veče.',$2,'/images/living.jpg',320000)",
      [
        services[2].id,
        "Televizor na svom mestu, a vi bez brige. Pošaljite model televizora, tip zida i informaciju o nosaču kako bismo pripremili ponudu za montažu.",
      ],
    );
    const migration = await readFile(
      "supabase/migrations/002_premium_catalog.sql",
      "utf8",
    );
    await db.exec(migration);
    await db.exec(migration);
    const additions = await readFile("supabase/migrations/004_home_services.sql", "utf8");
    await db.exec(additions);
    await db.exec(additions);
    for (const service of additionalServices) {
      const stored = (await db.query<{ slug: string; description: string }>(
        "select slug,description from public.services where id=$1", [service.id],
      )).rows[0];
      assert.equal(stored.slug, service.slug);
      assert.equal(stored.description, service.description);
    }
    const prices = await readFile("supabase/migrations/005_service_prices.sql", "utf8");
    await db.exec(prices);
    await db.exec(prices);
    for (const [slug, pricing] of Object.entries(servicePricing)) {
      if (["pranje-tepiha", "ugradnja-tv-a"].includes(slug)) continue;
      const stored = (await db.query<{ price: string }>("select price from public.services where slug=$1", [slug])).rows[0];
      assert.equal(Number(stored.price), pricing.price);
    }
    const existing = (
      await db.query<{ name: string; price: number; active: boolean }>(
        "select name,price,active from public.services where id=$1",
        [services[0].id],
      )
    ).rows[0];
    assert.equal(existing.name, "Admin name");
    assert.equal(Number(existing.price), 450000);
    assert.equal(existing.active, false);
    const tv = (
      await db.query<{ name: string; description: string; price: number }>(
        "select name,description,price from public.services where id=$1",
        [services[2].id],
      )
    ).rows[0];
    assert.equal(tv.name, "Montaža TV-a");
    assert.equal(tv.description, services[2].description);
    assert.equal(Number(tv.price), 320000);
    assert.equal(
      (await db.query("select * from public.requests")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.services")).rows.length,
      services.length,
    );
    assert.equal(
      (
        await db.query("select * from public.services where id=$1", [
          packageServiceId,
        ])
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
