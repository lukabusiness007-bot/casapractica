import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { clubPrice, normalizePhone, washingEstimate } from "../lib/club";
import { commerceNote, commerceSchema } from "../lib/growth";
import { services } from "../lib/catalog";
const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const SID = services.find((service) => service.slug === "ugradnja-tv-a")!.id;
async function setup() {
  const db = new PGlite();
  await db.exec(
    "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;",
  );
  await db.exec(
    (await readFile("supabase/migrations/001_initial.sql", "utf8")).replace(
      "create extension if not exists pgcrypto;",
      "",
    ),
  );
  await db.exec(await readFile("supabase/seed.sql", "utf8"));
  for (const file of [
    "002_premium_catalog.sql",
    "003_growth.sql",
    "004_home_services.sql",
    "005_service_prices.sql",
    "006_rounded_service_prices.sql",
    "007_washing_prices.sql",
    "008_service_offer.sql",
    "009_club_conversion.sql",
  ])
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  await db.query(
    "insert into auth.users values($1,'a@example.com',now(),'{}'),($2,'b@example.com',now(),'{}'),($3,'c@example.com',now(),'{}')",
    [A, B, C],
  );
  return db;
}
async function request(
  db: PGlite,
  user = A,
  phone = "+381641234567",
  referral?: string,
) {
  const result = await db.query<{ id: string }>(
    "insert into public.requests(user_id,service_id,name,email,phone,location,commerce) values($1,$2,'Test','a@example.com',$3,'Beograd',$4::jsonb) returning id",
    [
      user,
      SID,
      phone,
      JSON.stringify(referral ? { referral_code: referral } : {}),
    ],
  );
  return result.rows[0].id;
}
async function quote(db: PGlite, rid: string, base: number) {
  return (
    await db.query<{ id: string }>(
      "select public.save_quote($1,$2,0,'Dogovorena usluga') as id",
      [rid, base],
    )
  ).rows[0].id;
}
async function pay(db: PGlite, qid: string, user: string, event = qid) {
  const q = (
    await db.query<{ total_amount: number }>(
      "select (public.begin_checkout($1,$2)).*",
      [qid, user],
    )
  ).rows[0];
  await db.query("select public.record_stripe_payment($1,$2,$3,$4,'rsd',$5)", [
    `evt_${event}`,
    qid,
    `pi_${qid}`,
    q.total_amount,
    `cs_${qid}`,
  ]);
}
test("club prices, material-specific washing estimates and phone identity agree", () => {
  assert.equal(clubPrice(98000), 93100);
  assert.equal(clubPrice(90000), 85500);
  assert.equal(clubPrice(1100000), 1045000);
  assert.equal(
    washingEstimate({ area: 8, method: "wet", transport: true }),
    884000,
  );
  assert.equal(clubPrice(884000), 839800);
  assert.equal(
    washingEstimate({ area: 8, method: "semi-dry", transport: false }),
    960000,
  );
  assert.throws(() =>
    washingEstimate({ area: -1, method: "wet", transport: false }),
  );
  assert.equal(
    normalizePhone("064 1234567"),
    normalizePhone("00381 64 1234567"),
  );
  const carpet = services.find((service) => service.slug === "pranje-tepiha")!;
  const input = commerceSchema.parse({
    washing: { area: 8, method: "wet", transport: true },
  });
  assert.match(commerceNote(input, carpet, services), /8840 RSD/);
  assert.ok(
    !commerceSchema.safeParse({
      additional_service_ids: [SID],
      washing_extras: [
        { key: "upholstery", count: 1 },
        { key: "single-mattress", count: 1 },
      ],
    }).success,
  );
  assert.ok(
    !commerceSchema.safeParse({
      washing_extras: [
        { key: "upholstery", count: 1 },
        { key: "upholstery", count: 1 },
      ],
    }).success,
  );
  assert.throws(() =>
    commerceNote(
      input,
      services.find((service) => service.slug === "ugradnja-tv-a")!,
      services,
    ),
  );
});
test("database applies 5% on quotes and late membership, validates item sums and preserves locked invoices", async () => {
  const db = await setup();
  try {
    const rid = await request(db);
    const qid = await quote(db, rid, 98000);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [qid],
        )
      ).rows[0].total_amount,
      98000,
    );
    await db.query("insert into memberships(user_id) values($1)", [A]);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [qid],
        )
      ).rows[0].total_amount,
      93100,
    );
    await db.query(
      "select public.save_quote($1,98000,90000,'Cannot forge discount')",
      [rid],
    );
    assert.equal(
      (
        await db.query<{ discount_amount: number }>(
          "select discount_amount from quotes where id=$1",
          [qid],
        )
      ).rows[0].discount_amount,
      4900,
    );
    const items = [
      { label: "Pranje", amount: 98000, kind: "primary" },
      { label: "Transport", amount: 100000, kind: "travel" },
    ];
    await db.query(
      "select public.save_itemized_quote($1,$2::jsonb,'Pranje i transport')",
      [rid, JSON.stringify(items)],
    );
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [qid],
        )
      ).rows[0].total_amount,
      188100,
    );
    await db.query("select public.begin_checkout($1,$2)", [qid, A]);
    await assert.rejects(
      db.query("select public.save_quote($1,1,0,'Changed quote')", [rid]),
      /locked/,
    );
    await assert.rejects(
      db.query(
        "select public.record_stripe_payment('bad',$1,'pi_bad',198000,'rsd','cs_bad')",
        [qid],
      ),
      /Payment mismatch/,
    );
    await pay(db, qid, A);
    await db.query(
      "select public.record_stripe_payment($1,$2,$3,188100,'rsd',$4)",
      [`evt_${qid}`, qid, `pi_${qid}`, `cs_${qid}`],
    );
    assert.equal(
      (await db.query("select * from payments where quote_id=$1", [qid])).rows
        .length,
      1,
    );
    assert.equal(
      (await db.query("select * from business_events where event_name='paid'"))
        .rows.length,
      1,
    );
    const old = await request(db, B, "0651234567");
    const oldQuote = await quote(db, old, 100000);
    await db.query("select public.begin_checkout($1,$2)", [oldQuote, B]);
    await db.query("insert into memberships(user_id) values($1)", [B]);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [oldQuote],
        )
      ).rows[0].total_amount,
      100000,
    );
    await db.exec(
      `set role authenticated;select set_config('test.uid','${B}',false)`,
    );
    await assert.rejects(
      db.query("select public.save_itemized_quote($1,$2::jsonb,'Unsafe')", [
        rid,
        JSON.stringify(items),
      ]),
      /permission denied/,
    );
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
test("referral credits require paid completion, are idempotent, do not stack, enforce caps and reverse after refunds", async () => {
  const db = await setup();
  try {
    await db.query("insert into memberships(user_id) values($1),($2),($3)", [
      A,
      B,
      C,
    ]);
    await db.query(
      "insert into referral_codes(code,user_id) values('abcdef123456',$1)",
      [A],
    );
    const rid = await request(db, B, "0651234567", "abcdef123456");
    const qid = await quote(db, rid, 1200000);
    await pay(db, qid, B);
    assert.equal((await db.query("select * from club_credits")).rows.length, 0);
    await db.query("select public.update_request($1,'completed',null)", [rid]);
    assert.equal(
      (await db.query("select * from club_credits where status='pending'")).rows
        .length,
      2,
    );
    await db.query("select public.approve_referral($1)", [rid]);
    await db.query("select public.approve_referral($1)", [rid]);
    assert.equal(
      (await db.query("select * from club_credits where status='available'"))
        .rows.length,
      2,
    );
    const nextA = await request(db, A);
    const nextAQuote = await quote(db, nextA, 500000);
    const nextB = await request(db, B, "0651234567");
    const nextBQuote = await quote(db, nextB, 500000);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [nextAQuote],
        )
      ).rows[0].total_amount,
      450000,
    );
    // Cancelled quotes must not steal a credit subsequently reserved by another quote.
    await db.query("select public.update_request($1,'cancelled',null)", [
      nextB,
    ]);
    const replacement = await request(db, B, "0651234567");
    const replacementQuote = await quote(db, replacement, 500000);
    await db.query("select public.update_request($1,'received',null)", [nextB]);
    await quote(db, nextB, 500000);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [nextBQuote],
        )
      ).rows[0].total_amount,
      475000,
    );
    assert.equal(
      (
        await db.query<{ reserved_quote_id: string }>(
          "select reserved_quote_id from club_credits where user_id=$1",
          [B],
        )
      ).rows[0].reserved_quote_id,
      replacementQuote,
    );
    const big = await request(db, A);
    const bigQuote = await quote(db, big, 2000000);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [bigQuote],
        )
      ).rows[0].total_amount,
      1900000,
    );
    const secondReferral = await request(db, C, "0661234567", "abcdef123456");
    const secondQuote = await quote(db, secondReferral, 1200000);
    await pay(db, secondQuote, C);
    await db.query("select public.update_request($1,'completed',null)", [
      secondReferral,
    ]);
    await assert.rejects(
      db.query("select public.approve_referral($1)", [secondReferral]),
      /Monthly credit limit/,
    );
    await db.query(
      "update club_credits set expires_at=now()-interval '1 second' where user_id=$1 and source_request_id=$2",
      [B, rid],
    );
    await db.query("select public.expire_club_reservations($1)", [B]);
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [replacementQuote],
        )
      ).rows[0].total_amount,
      475000,
    );
    assert.equal(
      (
        await db.query<{ credit_id: string | null }>(
          "select credit_id from quotes where id=$1",
          [replacementQuote],
        )
      ).rows[0].credit_id,
      null,
    );
    await pay(db, nextAQuote, A);
    assert.equal(
      (await db.query("select * from club_credits where status='redeemed'"))
        .rows.length,
      1,
    );
    await db.query(
      "select public.record_stripe_refund('refund_source',$1,200000)",
      [`pi_${qid}`],
    );
    assert.equal(
      (
        await db.query(
          "select * from club_credits where source_request_id=$1 and status='reversed'",
          [rid],
        )
      ).rows.length,
      2,
    );
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [replacementQuote],
        )
      ).rows[0].total_amount,
      475000,
    );
    assert.equal(
      (
        await db.query<{ total_amount: number }>(
          "select total_amount from quotes where id=$1",
          [nextAQuote],
        )
      ).rows[0].total_amount,
      450000,
      "paid invoice stays immutable",
    );
    await db.exec(
      `set role authenticated;select set_config('test.uid','${C}',false)`,
    );
    assert.equal(
      (await db.query("select * from club_credits where user_id=$1", [A])).rows
        .length,
      0,
    );
    await assert.rejects(
      db.query("select public.approve_referral($1)", [secondReferral]),
      /permission denied/,
    );
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
test("repeat and change requests isolate owners, deduplicate retries and retain confirmed appointments", async () => {
  const db = await setup();
  try {
    const rid = await request(db);
    await db.query("select public.update_request($1,'completed',null)", [rid]);
    const key = crypto.randomUUID();
    const repeat = await db.query<{ id: string; repeat_of: string }>(
      "select (public.repeat_visit($1,$2,$3,null)).*",
      [rid, A, key],
    );
    const replay = await db.query<{ id: string }>(
      "select (public.repeat_visit($1,$2,$3,null)).*",
      [rid, A, key],
    );
    assert.equal(repeat.rows[0].id, replay.rows[0].id);
    assert.equal(repeat.rows[0].repeat_of, rid);
    await assert.rejects(
      db.query("select public.repeat_visit($1,$2,$3,null)", [
        rid,
        B,
        crypto.randomUUID(),
      ]),
      /Visit unavailable/,
    );
    const next = repeat.rows[0].id;
    const changeKey = crypto.randomUUID();
    await db.query(
      "select public.request_visit_change($1,$2,$3,'pause',null,'budget','Manji obim')",
      [next, A, changeKey],
    );
    await db.query(
      "select public.request_visit_change($1,$2,$3,'pause',null,'budget','Manji obim')",
      [next, A, changeKey],
    );
    assert.equal(
      (await db.query("select * from visit_changes")).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query<{ status: string }>(
          "select status from requests where id=$1",
          [next],
        )
      ).rows[0].status,
      "received",
    );
    await assert.rejects(
      db.query(
        "select public.request_visit_change($1,$2,$3,'reschedule','2000-01-01','other','')",
        [next, A, crypto.randomUUID()],
      ),
      /future date/,
    );
    await db.exec(
      `set role authenticated;select set_config('test.uid','${B}',false)`,
    );
    assert.equal(
      (await db.query("select * from visit_changes")).rows.length,
      0,
    );
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
