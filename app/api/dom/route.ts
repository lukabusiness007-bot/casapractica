import { growthReady } from "@/lib/data";
import { NextResponse } from "next/server";
import { assertOrigin, requireUser, failure, HttpError } from "@/lib/http";
import { homeProfileSchema } from "@/lib/home-profile";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const user = await requireUser();
    if (!(await growthReady()))
      throw new HttpError(503, "Dodatne mogućnosti trenutno nisu dostupne.");
    const parsed = homeProfileSchema.safeParse(await req.json());
    if (!parsed.success) throw new HttpError(400, "Proverite podatke o domu.");
    const { id, ...record } = parsed.data;
    const query = id
      ? db()
          .from("home_profiles")
          .update(record)
          .eq("id", id)
          .eq("user_id", user.id)
      : db()
          .from("home_profiles")
          .insert({ ...record, user_id: user.id });
    const { data, error } = await query.select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Dom nije pronađen.");
    return NextResponse.json({ message: "Sačuvano." });
  } catch (error) {
    return failure(error);
  }
}
