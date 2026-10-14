import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, access } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pestServices, pestContent } from "../lib/pest-services";
import { serviceCategory, services, packageServiceId } from "../lib/catalog";
import { requestSchema } from "../lib/validation";
import { commerceSchema, commerceNote, collections } from "../lib/growth";
import { pestAssessmentSchema, pestAssessmentFromForm } from "../lib/pest-assessment";
import { translator } from "../lib/i18n";
import { locales } from "../lib/i18n/routing";
import { publicLandingPath } from "../lib/attribution";

const contact = { name: "Ana", phone: "+381641234567", location: "Novi Beograd" };
const assessment = { property_type: "apartment", pest: "unknown", children: true, pets: false, affected: "Kuhinja, dve nedelje", previous: "", plan: "assessment" };

test("DDD enquiries require a bounded assessment, keep unknown area valid and reject invented prices", () => {
  for (const service of pestServices) {
    const input = { ...contact, service_id: service.id, commerce: { pest_assessment: assessment } };
    assert.ok(requestSchema.safeParse(input).success, service.slug);
    assert.equal(requestSchema.safeParse({ ...contact, service_id: service.id }).success, false);
    for (const change of [{ area: 0 }, { area: -1 }, { area: Infinity }, { area: 100001 }, { area: "50" }, { affected: "x".repeat(501) }, { children: "yes" }, { price: 10 }])
      assert.equal(requestSchema.safeParse({ ...input, commerce: { pest_assessment: { ...assessment, ...change } } }).success, false);
  }
  const form = new FormData();
  form.set("pest_property", "house"); form.set("pest_type", "rodents"); form.set("pest_area", ""); form.set("pest_pets", "on");
  const result = pestAssessmentSchema.parse(pestAssessmentFromForm(form));
  assert.equal(result.area, undefined);
  assert.equal(result.pets, true);
  form.set("pest_area", "75.5");
  assert.equal(pestAssessmentSchema.parse(pestAssessmentFromForm(form)).area, 75.5);
});

test("assessment summaries reach administration with server labels and cannot be attached to unrelated services", () => {
  const commerce = commerceSchema.parse({ pest_assessment: { ...assessment, area: 60 } });
  const summary = commerceNote(commerce, pestServices[0], services);
  assert.match(summary, /Stan; površina: 60 m²/);
  assert.match(summary, /Deca: da; kućni ljubimci: ne/);
  assert.match(summary, /Kuhinja, dve nedelje/);
  assert.throws(() => commerceNote(commerce, services[0], services), /Proverite izbor obima/);
  const bundle = services.find(service => service.id === packageServiceId)!;
  for (const collection of collections.filter(item => item.id.startsWith("zastita-"))) {
    const input = { ...contact, service_id: bundle.id, package: { plan_id: "once", items: [{ service_id: pestServices[5].id, frequency: "once" }] }, commerce: { collection_id: collection.id, pest_assessment: assessment } };
    const parsed = requestSchema.parse(input);
    assert.match(commerceNote(parsed.commerce!, bundle, services), /DDD procena/);
    assert.match(commerceNote(parsed.commerce!, bundle, services), new RegExp(collection.name));
    assert.equal(requestSchema.safeParse({ ...input, commerce: { collection_id: collection.id } }).success, false);
  }
});

test("DDD pages have distinct localized copy, discoverable URLs, complete scopes and an optimized asset", async () => {
  await access("public/images/services/ddd-zastita.webp");
  for (const locale of locales) {
    const t = translator(locale);
    assert.equal(new Set(pestServices.map(service => t(pestContent[service.slug].title))).size, 9);
    for (const service of pestServices) {
      assert.equal(serviceCategory(service), "pest-control");
      assert.equal(service.price, null);
      const content = pestContent[service.slug];
      for (const source of [content.title, ...content.tasks, ...content.faq])
        if (locale !== "sr") assert.notEqual(t(source), source, `${locale}: ${source}`);
      const prefix = locale === "sr" ? "" : `/${locale}`;
      assert.equal(publicLandingPath(`${prefix}/usluge/${service.slug}`), `${prefix}/usluge/${service.slug}`);
      assert.equal(publicLandingPath(`${prefix}/ddd`), `${prefix}/ddd`);
      assert.equal(publicLandingPath(`${prefix}/kolekcije/zastita-zgrade`), `${prefix}/kolekcije/zastita-zgrade`);
    }
  }
});

test("DDD migration is repeatable and preserves existing IDs, requests and unrelated admin content", async () => {
  const db = new PGlite();
  try {
    await db.exec("create table services(id uuid primary key,slug text unique,name text,tagline text,description text,image text,price bigint,active boolean,sort_order integer); create table requests(id integer primary key,service_id uuid references services(id),commerce jsonb,note text);");
    const oldId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    await db.query("insert into services(id,slug,name) values($1,'deratizacija','Old DDD name'),($2,'custom-service','Admin content')", [oldId, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"]);
    await db.query("insert into requests(id,service_id,note) values(1,$1,'Existing request')", [oldId]);
    const sql = await readFile("supabase/migrations/011_ddd_services.sql", "utf8");
    await db.exec(sql); await db.exec(sql);
    assert.equal((await db.query("select * from services")).rows.length, 10);
    assert.deepEqual((await db.query("select service_id,note from requests")).rows, [{ service_id: oldId, note: "Existing request" }]);
    assert.equal((await db.query<{ name: string }>("select name from services where slug='custom-service'")).rows[0].name, "Admin content");
    for (const service of pestServices) {
      const row = (await db.query<{ name: string; price: null; active: boolean }>("select name,price,active from services where slug=$1", [service.slug])).rows[0];
      assert.equal(row.name, service.name); assert.equal(row.price, null); assert.equal(row.active, true);
    }
  } finally { await db.close(); }
});
