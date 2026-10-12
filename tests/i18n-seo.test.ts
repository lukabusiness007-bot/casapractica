import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { localePath, splitLocale, locales } from "../lib/i18n/routing";
import { translator } from "../lib/i18n";
import { pageMetadata, languageAlternates, absoluteUrl } from "../lib/seo";
import { services } from "../lib/catalog";
import messages from "../lib/i18n/messages.json";

test("localized URLs preserve service, query and anchor without touching external or API links", () => {
  assert.equal(
    localePath("/usluge/pranje-tepiha?source=menu#form", "de"),
    "/de/usluge/pranje-tepiha?source=menu#form",
  );
  assert.equal(
    localePath("/ru/usluge/pranje-tepiha", "tr"),
    "/tr/usluge/pranje-tepiha",
  );
  assert.equal(localePath("/en", "sr"), "/");
  assert.equal(
    localePath("/prijava?mode=reset", "ru"),
    "/ru/prijava?mode=reset",
  );
  assert.equal(localePath("https://example.com", "de"), "https://example.com");
  assert.equal(localePath("/api/auth", "en"), "/api/auth");
  assert.equal(localePath("/admin", "en"), "/admin");
  assert.deepEqual(splitLocale("/english"), { locale: "sr", path: "/english" });
});

test("metadata has self canonicals and reciprocal language alternates", () => {
  const path = "/usluge/pranje-tepiha";
  for (const locale of locales) {
    const metadata = pageMetadata(locale, path, "Title", "Description");
    assert.equal(metadata.alternates?.canonical, absoluteUrl(path, locale));
    assert.deepEqual(metadata.alternates?.languages, languageAlternates(path));
  }
  assert.equal(Object.keys(languageAlternates(path)).length, 6);
  const privateMetadata = pageMetadata("en", "/nalog", "Account", "Account", {
    noindex: true,
  });
  assert.deepEqual(privateMetadata.robots, { index: false, follow: true });
  assert.equal(privateMetadata.alternates?.languages, undefined);
});

test("all supported languages include public copy and catalog translations", () => {
  const entries = Object.entries(messages);
  const sourceKeys = Object.keys(messages.en).sort();
  for (const [locale, dictionary] of entries) {
    assert.deepEqual(
      Object.keys(dictionary).sort(),
      sourceKeys,
      `${locale} dictionary must be complete`,
    );
    assert.ok(
      Object.values(dictionary).every((value) => value.trim().length > 0),
    );
    for (const service of services)
      for (const field of ["name", "tagline", "description"] as const) {
        assert.notEqual(
          translator(locale as "en")(service[field]),
          service[field],
          `${locale}: ${service[field]}`,
        );
      }
  }
  const files: string[] = [];
  function collect(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (path.endsWith(".tsx")) files.push(path);
    }
  }
  collect("app");
  collect("components");
  for (const file of files)
    for (const match of readFileSync(file, "utf8").matchAll(
      /\bt\("([^"\n]+)"\)/g,
    )) {
      assert.ok(
        match[1] in messages.en,
        `${file}: missing translation for ${match[1]}`,
      );
    }
});

test("WhatsApp drafts use the selected language while preserving request references", async () => {
  const { whatsappLink } = await import("../lib/validation");
  const link = whatsappLink("381641234567", "Pranje tepiha", "PZ-123", "de");
  assert.ok(link);
  const message = new URL(link).searchParams.get("text")!;
  assert.match(message, /Teppichreinigung/);
  assert.match(message, /PZ-123/);
  assert.ok(!message.includes("Zdravo"));
  assert.equal(whatsappLink("", "Pranje tepiha", "PZ-123", "tr"), null);
});
