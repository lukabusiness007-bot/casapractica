import { growthReady } from "@/lib/data";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { assertOrigin, requireUser, failure, HttpError } from "@/lib/http";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const user = await requireUser();
    if (!(await growthReady()))
      throw new HttpError(503, "Dodatne mogućnosti trenutno nisu dostupne.");
    const client = db();
    const { data: member, error: memberError } = await client.from("memberships").select("user_id").eq("user_id", user.id).maybeSingle();
    if (memberError) throw memberError;
    if (!member) throw new HttpError(403, "Pristupite besplatnom klubu pre pravljenja linka za preporuku.");
    const { error } = await client
      .from("referral_codes")
      .upsert(
        { user_id: user.id, code: randomBytes(6).toString("hex") },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    if (error) throw error;
    const { data, error: readError } = await client
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .single();
    if (readError) throw readError;
    return NextResponse.json({ code: data.code, message: "Sačuvano." });
  } catch (error) {
    return failure(error);
  }
}
