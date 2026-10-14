import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { localePath, splitLocale, locales, languageTags, languageNames } from "../lib/i18n/routing";
import { translator } from "../lib/i18n";
import { pageMetadata, languageAlternates, absoluteUrl } from "../lib/seo";
import { collections, upgrades } from "../lib/growth";
import { casaPlans } from "../lib/packages";
import { serviceScopes } from "../lib/catalog-additions";
import { services } from "../lib/catalog";
import { washingPriceList } from "../lib/washing-pricing";
import messages from "../lib/i18n/messages.json";
import { seoCopy } from "../lib/seo-copy";
import { guides } from "../lib/guides";
import { serviceAdvice } from "../lib/service-advice";
import { servicePriceLabel } from "../lib/catalog";

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
  assert.equal(Object.keys(languageAlternates(path)).length, locales.length + 1);
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
    for (const group of washingPriceList) {
      assert.ok(group.title in dictionary, `${locale}: missing washing category: ${group.title}`);
      for (const item of group.items)
        for (const copy of [item.name, item.detail, item.unit].filter(Boolean) as string[])
          assert.ok(copy in dictionary, `${locale}: missing washing copy: ${copy}`);
    }
    for (const scope of Object.values(serviceScopes))
      for (const task of scope.tasks)
        assert.ok(task in dictionary, `${locale}: missing task translation: ${task}`);
    for (const service of services)
      for (const field of ["name", "tagline", "description"] as const) {
        assert.notEqual(
          translator(locale as "en")(service[field]),
          service[field],
          `${locale}: ${service[field]}`,
        );
      }
  }
  for (const [, dictionary] of entries)
    for (const source of [
      ...collections.flatMap((item) => [item.name, item.description]),
      ...upgrades.flatMap((item) => [item.name, item.description]),
      ...casaPlans.flatMap((item) => [
        item.name,
        item.rhythm,
        item.description,
      ]),
    ])
      assert.ok(
        source in dictionary,
        `Missing commercial translation: ${source}`,
      );
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

test("Simplified Chinese covers routing, metadata, editorial copy, price labels and WhatsApp drafts", async () => {
  const { whatsappLink } = await import("../lib/validation");
  assert.equal(languageTags.zh, "zh-Hans");
  assert.equal(languageNames.zh, "中文（简体）");
  assert.deepEqual(splitLocale("/zh/usluge/deratizacija"), { locale: "zh", path: "/usluge/deratizacija" });
  assert.equal(localePath("/en/usluge/deratizacija?q=ants#zahtev", "zh"), "/zh/usluge/deratizacija?q=ants#zahtev");
  assert.deepEqual(splitLocale("/zhongwen"), { locale: "sr", path: "/zhongwen" });
  assert.equal(languageAlternates("/ddd")["zh-Hans"], absoluteUrl("/ddd", "zh"));
  const metadata = pageMetadata("zh", "/", "标题", "说明");
  assert.equal((metadata.openGraph as { locale: string }).locale, "zh_CN");
  for (const source of [seoCopy("zh").homeDescription, seoCopy("zh").approachText, ...guides("zh").flatMap(guide => [guide.title, guide.intro, ...guide.sections.flat()]), ...["ciscenje-doma", "servis-klime", "ugradnja-tv-a", "sklapanje-namestaja", "krecenje"].flatMap(slug => serviceAdvice(slug, "zh")?.text || [])])
    assert.match(source, /\p{Script=Han}/u);
  const t = translator("zh");
  assert.match(t("Premijum pristup: jasna ponuda, pažljivo planirana poseta i briga o detaljima."), /高品质/);
  assert.match(servicePriceLabel({ slug: "pranje-tepiha", price: 98000 }, "zh", t), /起 · 每平方米$/);
  const link = whatsappLink("381641234567", "Deratizacija", "PZ-ZH-123", "zh")!;
  const draft = new URL(link).searchParams.get("text")!;
  assert.match(draft, /灭鼠服务/);
  assert.match(draft, /PZ-ZH-123/);
});
