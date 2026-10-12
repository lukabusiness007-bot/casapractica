import { growthReady } from "@/lib/data";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, requireUser, failure, HttpError } from "@/lib/http";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const user = await requireUser();
    if (!(await growthReady()))
      throw new HttpError(503, "Dodatne mogućnosti trenutno nisu dostupne.");
    const input = z
      .object({
        request_id: z.string().uuid(),
        score: z.coerce.number().int().min(1).max(5),
      })
      .safeParse(await req.json());
    if (!input.success) throw new HttpError(400, "Izaberite ocenu od 1 do 5.");
    const { data, error } = await db()
      .from("requests")
      .update({ satisfaction_score: input.data.score })
      .eq("id", input.data.request_id)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Zahtev nije dostupan za ocenjivanje.");
    return NextResponse.json({ message: "Hvala na vašoj oceni." });
  } catch (error) {
    return failure(error);
  }
}
