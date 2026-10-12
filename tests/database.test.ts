import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const SID = "11111111-1111-4111-8111-111111111111";
async function setup() {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`,
  );
  const migration = (
    await readFile("supabase/migrations/001_initial.sql", "utf8")
  ).replace("create extension if not exists pgcrypto;", "");
  await db.exec(migration);
  await db.exec(await readFile("supabase/seed.sql", "utf8"));
  await db.exec(
    `insert into auth.users values('${A}','ana@example.com',now(),'{"full_name":"Ana","role":"admin","club_requested":true}'),('${B}','b@example.com',null,'{}');`,
  );
  return db;
}
async function asUser(db: PGlite, id: string, sql: string) {
  await db.exec(
    `set role authenticated;select set_config('test.uid','${id}',false);`,
  );
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role;");
  }
}
test("database: verified claim, RLS isolation, immutable amounts, payment replay and refunds", async () => {
  const db = await setup();
  try {
    const r = await db.query<{ id: string }>(
      `insert into public.requests(service_id,name,email,phone,location) values('${SID}','Ana','ana@example.com','123456789','Beograd') returning id`,
    );
    const rid = r.rows[0].id;
    await assert.rejects(
      asUser(db, B, "select public.claim_my_requests()"),
      /Verified user/,
    );
    await asUser(db, A, "select public.claim_my_requests()");
    assert.equal(
      (await asUser(db, A, "select * from public.requests")).rows.length,
      1,
    );
    assert.equal(
      (await asUser(db, B, "select * from public.requests")).rows.length,
      0,
    );
    assert.equal(
      (await asUser(db, A, "select * from public.admins")).rows.length,
      0,
      "metadata cannot grant admin",
    );
    await assert.rejects(
      asUser(db, B, `select public.save_quote('${rid}',10000,0,'Evil quote')`),
      /permission denied/,
    );
    const q = await db.query<{ id: string }>(
      `select public.save_quote('${rid}',120000,20000,'Dogovorena usluga') as id`,
    );
    const qid = q.rows[0].id;
    await assert.rejects(
      db.query(`select public.begin_checkout('${qid}','${B}')`),
      /Quote unavailable/,
    );
    await db.query(`select public.begin_checkout('${qid}','${A}')`);
    await assert.rejects(
      db.query(`select public.save_quote('${rid}',90000,0,'Changed amount')`),
      /Quote locked/,
    );
    await assert.rejects(
      db.query(`select public.update_request('${rid}','cancelled',null)`),
      /Checkout started/,
    );
    await assert.rejects(
      db.query(
        `select public.record_stripe_payment('evt_bad','${qid}','pi_1',1,'rsd','cs_1')`,
      ),
      /Payment mismatch/,
    );
    assert.equal(
      (await db.query(`select * from public.stripe_events where id='evt_bad'`))
        .rows.length,
      0,
      "bad event rolls back",
    );
    await db.query(
      `select public.record_stripe_payment('evt_1','${qid}','pi_1',100000,'rsd','cs_1')`,
    );
    await db.query(
      `select public.record_stripe_payment('evt_1','${qid}','pi_1',100000,'rsd','cs_1')`,
    );
    await db.query(
      `select public.record_stripe_payment('evt_2','${qid}','pi_1',100000,'rsd','cs_1')`,
    );
    assert.equal(
      (await db.query("select * from public.payments")).rows.length,
      1,
    );
    await assert.rejects(
      db.query(`select public.begin_checkout('${qid}','${A}')`),
      /Quote unavailable/,
    );
    assert.equal(
      (await asUser(db, B, "select * from public.payments")).rows.length,
      0,
    );
    await db.query(`select public.record_stripe_refund('evt_r1','pi_1',40000)`);
    await db.query(
      `select public.record_stripe_refund('evt_r2','pi_1',100000)`,
    );
    await db.query(`select public.record_stripe_refund('evt_r3','pi_1',40000)`);
    const payment = await db.query<{ status: string; refunded_amount: number }>(
      "select status,refunded_amount from public.payments",
    );
    assert.equal(payment.rows[0].status, "refunded");
    assert.equal(payment.rows[0].refunded_amount, 100000);
    await db.query(`select public.update_request('${rid}','cancelled',null)`);
    const cancelled = await db.query<{ status: string }>(`select status from public.requests where id='${rid}'`);
    assert.equal(cancelled.rows[0].status, 'cancelled');
  } finally {
    await db.close();
  }
});
test("database: member early access, public timing and rate limits", async () => {
  const db = await setup();
  try {
    await asUser(db, A, "select public.claim_my_requests()");
    await db.exec(
      `insert into public.benefits(title,description,member_at,public_at) values('Early','Description',now()-interval '1 day',now()+interval '1 day'),('Future','Description',now()+interval '1 day',null),('Public','Description',now()-interval '2 days',now()-interval '1 day');`,
    );
    assert.equal(
      (await asUser(db, A, "select * from public.benefits")).rows.length,
      2,
    );
    assert.equal(
      (await asUser(db, B, "select * from public.benefits")).rows.length,
      1,
    );
    await db.exec("set role anon;select set_config('test.uid','',false);");
    assert.equal(
      (await db.query("select * from public.benefits")).rows.length,
      1,
    );
    await db.exec("reset role;");
    for (let i = 0; i < 3; i++) {
      const result = await db.query<{ ok: boolean }>(
        `select public.consume_rate_limit('key',2) as ok`,
      );
      assert.equal(result.rows[0].ok, i < 2);
    }
  } finally {
    await db.close();
  }
});
