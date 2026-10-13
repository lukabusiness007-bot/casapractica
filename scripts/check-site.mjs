// HTTP smoke test of rendered HTML, independent of client-side JavaScript.
import assert from "node:assert/strict";
import { services } from "../lib/catalog.ts";
import { collections } from "../lib/growth.ts";
const base = process.env.TEST_SITE_URL || "http://localhost:3100";
const locales = ["sr", "en", "ru", "de", "tr"];
const publicPaths = [
  "/",
  "/usluge",
  "/klub",
  "/paketi",
  "/konsultacije",
  "/kolekcije",
  ...collections.map((item) => `/kolekcije/${item.id}`),
  ...services.filter((service) => service.active).map((service) => `/usluge/${service.slug}`),
];
const paths = [
  ...publicPaths,
  "/prijava",
  "/registracija",
  "/nalog",
  "/privatnost",
  "/uslovi",
];
const checks = [];
for (const locale of locales)
  for (const path of paths) {
    const route =
      locale === "sr" ? path : `/${locale}${path === "/" ? "" : path}`;
    checks.push(async () => {
      const response = await fetch(base + route, {
        headers: { "User-Agent": "Googlebot" },
      });
      assert.equal(response.status, 200, route);
      const html = await response.text();
      assert.ok(
        html.includes(`lang="${locale === "sr" ? "sr-Latn" : locale}"`),
        route + " lang",
      );
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
      assert.equal(
        new URL(canonical?.[1]).pathname,
        route,
        route + " canonical",
      );
      assert.equal(
        (html.match(/<h1[ >]/g) || []).length,
        1,
        route + " single H1",
      );
      if (publicPaths.includes(path))
        assert.equal(
          (html.match(/rel="alternate" hrefLang=/g) || []).length,
          6,
          route + " hreflang",
        );
      else assert.ok(html.includes("noindex"), route + " private noindex");
      assert.ok(
        !html.includes("Naše usluge</") || locale === "sr",
        route + " translated navigation",
      );
      for (const match of html.matchAll(
        /<script type="application\/ld\+json">(.*?)<\/script>/g,
      ))
        JSON.parse(match[1]);
    });
  }
for (let i = 0; i < checks.length; i += 5)
  await Promise.all(checks.slice(i, i + 5).map((fn) => fn()));
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.equal(
  (sitemap.match(/<url>/g) || []).length,
  publicPaths.length * locales.length,
);
for (const path of ["/en/usluge/does-not-exist", "/xx", "/de/does-not-exist"])
  assert.equal((await fetch(base + path)).status, 404, path);
const redirect = await fetch(base + "/sr/usluge", { redirect: "manual" });
assert.equal(redirect.status, 308);
assert.equal(
  new URL(redirect.headers.get("location"), base).pathname,
  "/usluge",
);
assert.match(await (await fetch(base + "/robots.txt")).text(), /Sitemap:/);
const og = await fetch(base + "/opengraph-image");
assert.equal(og.status, 200);
assert.match(og.headers.get("content-type"), /image\/png/);
console.log(
  `${checks.length} rendered pages passed; ${publicPaths.length * locales.length} sitemap URLs, 404s, redirect, robots and social image verified.`,
);
