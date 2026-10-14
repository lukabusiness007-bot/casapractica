import { growthReady, attributionReady } from "@/lib/data";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { assertOrigin, assertReady, failure, HttpError } from "@/lib/http";
import { eventSchema } from "@/lib/growth";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    assertReady();
    if (!(await growthReady())) return new NextResponse(null, { status: 204 });
    const input = eventSchema.safeParse(await req.json());
    if (!input.success) throw new HttpError(400, "Neispravan događaj.");
    const ip =
      req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "local";
    const client = db();
    const { data: allowed, error: rateError } = await client.rpc(
      "consume_rate_limit",
      {
        p_key: `analytics:${createHash("sha256").update(ip).digest("hex")}`,
        p_limit: 150,
      },
    );
    if (rateError) throw rateError;
    if (!allowed)
      throw new HttpError(
        429,
        "Dostignut je broj zahteva. Pokušajte ponovo kasnije.",
      );
    const { attribution, ...event } = input.data;
    const { error } = await client.from("analytics_events").upsert(
      {
        ...event,
        ...((await attributionReady()) && attribution ? { attribution } : {}),
      },
      {
        onConflict: "session_id,event_name,context",
        ignoreDuplicates: true,
      },
    );
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return failure(error);
  }
}
