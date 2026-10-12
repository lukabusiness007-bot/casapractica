import { NextResponse } from "next/server";
import { assertOrigin, failure, requireUser } from "@/lib/http";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const u = await requireUser();
    const { error } = await db()
      .from("memberships")
      .upsert(
        { user_id: u.id },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    if (error) throw error;
    return NextResponse.json({
      message: "Dobro došli u casa practica klub.",
    });
  } catch (e) {
    return failure(e);
  }
}
