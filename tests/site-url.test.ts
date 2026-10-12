import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveSiteUrl,
  trustedSiteOrigins,
  isPublicProductionSite,
} from "../lib/site-url";

test("site URLs use a configured domain or the correct Vercel environment", () => {
  assert.equal(resolveSiteUrl({}), "http://localhost:3000");
  assert.equal(
    resolveSiteUrl({}, "http://localhost:3100"),
    "http://localhost:3100",
  );
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: " https://custom.example/path " }),
    "https://custom.example",
  );
  assert.equal(
    resolveSiteUrl({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "production.example",
      VERCEL_URL: "deployment.example",
    }),
    "https://production.example",
  );
  assert.equal(
    resolveSiteUrl({
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "production.example",
      VERCEL_URL: "preview.example",
    }),
    "https://preview.example",
  );
  assert.equal(
    resolveSiteUrl({ VERCEL_URL: "deployment.example" }),
    "https://deployment.example",
  );
  assert.throws(() =>
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }),
  );
  assert.throws(() =>
    resolveSiteUrl({
      NEXT_PUBLIC_SITE_URL: "https://user:password@example.com",
    }),
  );
});

test("origin checks allow only configured and platform-provided hosts", () => {
  const origins = trustedSiteOrigins({
    NEXT_PUBLIC_SITE_URL: "https://production.example",
    VERCEL_URL: "deployment.example",
  });
  assert.deepEqual(
    [...origins],
    ["https://production.example", "https://deployment.example"],
  );
  assert.equal(origins.has("https://attacker.example"), false);
  assert.equal(
    origins.has("https://production.example.attacker.example"),
    false,
  );
});

test("preview and development deployments stay out of search indexing", () => {
  assert.equal(isPublicProductionSite({}), false);
  assert.equal(
    isPublicProductionSite({ NEXT_PUBLIC_SITE_URL: "https://localhost" }),
    false,
  );
  assert.equal(
    isPublicProductionSite({
      NEXT_PUBLIC_SITE_URL: "https://production.example",
    }),
    true,
  );
  assert.equal(
    isPublicProductionSite({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "production.example",
    }),
    true,
  );
  assert.equal(
    isPublicProductionSite({
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SITE_URL: "https://production.example",
      VERCEL_URL: "preview.example",
    }),
    false,
  );
});
