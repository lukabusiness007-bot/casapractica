import { NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, failure, requireUser, HttpError } from "@/lib/http";
import { db } from "@/lib/supabase";
import { clubReady } from "@/lib/club-server";
import { isPublishedService } from "@/lib/service-availability";
const schema = z.object({
  request_id: z.string().uuid(),
  request_key: z.string().uuid(),
  action: z.enum(["repeat", "reschedule", "cancel", "pause", "less-often"]),
  desired_at: z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.iso.date().nullable(),
  ),
  reason: z
    .enum(["budget", "availability", "quality", "other"])
    .default("other"),
  note: z.string().trim().max(1000).default(""),
});
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const user = await requireUser();
    if (!(await clubReady()))
      throw new HttpError(503, "Upravljanje posetama trenutno nije dostupno.");
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      throw new HttpError(400, "Proverite izbor i željeni datum.");
    const input = parsed.data;
    const c = db();
    const limit = await c.rpc("consume_rate_limit", {
      p_key: `visits:${user.id}`,
      p_limit: 20,
    });
    if (limit.error) throw limit.error;
    if (!limit.data)
      throw new HttpError(
        429,
        "Dostignut je broj zahteva. Pokušajte ponovo kasnije.",
      );
    const { data: request, error } = await c
      .from("requests")
      .select("id,services(slug,active)")
      .eq("id", input.request_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    const service = request?.services as unknown as {
      slug: string;
      active: boolean;
    };
    if (
      !request ||
      (input.action === "repeat" &&
        (!service?.active || !isPublishedService(service)))
    )
      throw new HttpError(404, "Poseta nije dostupna.");
    if (input.action === "repeat") {
      const result = await c
        .rpc("repeat_visit", {
          p_request_id: input.request_id,
          p_user_id: user.id,
          p_key: input.request_key,
          p_desired: input.desired_at,
        })
        .single();
      if (result.error)
        throw new HttpError(
          409,
          "Ponovite završenu posetu i izaberite današnji ili budući datum.",
        );
      return NextResponse.json({
        message:
          "Novi zahtev je sačuvan. Tim potvrđuje aktuelni obim, cenu i termin.",
        reference: (result.data as { reference: string }).reference,
      });
    }
    const result = await c.rpc("request_visit_change", {
      p_request_id: input.request_id,
      p_user_id: user.id,
      p_key: input.request_key,
      p_action: input.action,
      p_desired: input.desired_at,
      p_reason: input.reason,
      p_note: input.note,
    });
    if (result.error)
      throw new HttpError(
        409,
        "Proverite status posete i željeni datum. Promenu potvrđuje tim.",
      );
    return NextResponse.json({
      message:
        "Zahtev za promenu je sačuvan. Postojeći dogovor važi dok tim ne potvrdi promenu.",
    });
  } catch (error) {
    return failure(error);
  }
}
