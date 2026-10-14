import assert from "node:assert/strict";
import { test } from "node:test";
import { isIndividualService, publicService, services } from "../lib/catalog";
import { isPublishedService, retiredServiceSlugs } from "../lib/service-availability";
import { requestSchema } from "../lib/validation";
import { packageSchema } from "../lib/packages";
import { collections } from "../lib/growth";

const contact = { name: "Ana", phone: "+381641234567", location: "Beograd" };

test("retired offers stay unbookable even when a connected database has not been migrated", () => {
  assert.equal(retiredServiceSlugs.size, 16);
  for (const slug of retiredServiceSlugs) {
    const archived = services.find((service) => service.slug === slug)!;
    assert.ok(archived, slug);
    assert.equal(archived.active, false, slug);
    assert.equal(isPublishedService({ ...archived, active: true }), false, slug);
    assert.equal(isIndividualService(archived), false, slug);
    assert.equal(requestSchema.safeParse({ ...contact, service_id: archived.id }).success, false, slug);
    assert.equal(packageSchema.safeParse({ plan_id: "custom", items: [{ service_id: archived.id, frequency: "once" }] }).success, false, slug);
  }
});

test("new cleaning and painting offers, collections and waste-removal copy agree", () => {
  assert.equal(services.filter(isPublishedService).filter(isIndividualService).length, 49);
  for (const slug of ["ciscenje-doma", "krecenje"]) {
    const service = services.find((item) => item.slug === slug)!;
    assert.equal(isPublishedService(service), true);
    assert.equal(service.price, null);
    assert.ok(requestSchema.safeParse({ ...contact, service_id: service.id }).success);
  }
  for (const collection of collections)
    for (const slug of collection.slugs)
      assert.ok(services.some((service) => service.slug === slug && isPublishedService(service)), collection.id);
  const waste = services.find((service) => service.slug === "iznosenje-smeca")!;
  const oldDatabaseRow = { ...waste, name: "Iznošenje smeća", tagline: "Jedna obaveza manje. Svakog dana.", image: "/images/services/iznosenje-smeca.webp" };
  assert.equal(publicService(oldDatabaseRow).name, "Iznošenje smeća, šuta i nameštaja");
});
