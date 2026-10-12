import { resolveSiteUrl } from "@/lib/site-url";
import { locales, localePath } from "@/lib/i18n/routing";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, assertReady, failure, HttpError } from "@/lib/http";
import { authClient } from "@/lib/supabase";
const schema = z.object({
  locale: z.enum(locales).default("sr"),
  mode: z.enum(["login", "register", "reset", "update", "logout"]),
  email: z.string().email().max(254).optional(),
  password: z.string().max(128).optional(),
  name: z.string().trim().max(100).optional(),
  club: z.string().optional(),
});
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    assertReady();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) throw new HttpError(400, "Proverite unete podatke.");
    const d = parsed.data;
    const c = await authClient();
    const origin = resolveSiteUrl();
    if (d.mode === "logout") {
      await c.auth.signOut();
      return NextResponse.json({ message: "Odjavljeni ste." });
    }
    if (
      ["register", "update"].includes(d.mode) &&
      (!d.password || d.password.length < 10)
    )
      throw new HttpError(400, "Lozinka mora imati najmanje 10 karaktera.");
    if (d.mode !== "update" && !d.email)
      throw new HttpError(400, "Unesite email adresu.");
    if (d.mode === "register") {
      if (!d.name || d.name.length < 2)
        throw new HttpError(400, "Unesite ime i prezime.");
      const { error } = await c.auth.signUp({
        email: d.email!,
        password: d.password!,
        options: {
          emailRedirectTo: `${origin}/auth/callback?locale=${d.locale}`,
          data: { full_name: d.name, club_requested: d.club === "yes" },
        },
      });
      if (error)
        throw new HttpError(
          400,
          "Registracija nije uspela. Proverite podatke ili pokušajte kasnije.",
        );
      return NextResponse.json({
        message:
          "Proverite email i potvrdite adresu pre prijavljivanja. Ako već imate nalog, prijavite se ili obnovite lozinku.",
      });
    }
    if (d.mode === "login") {
      if (!d.password) throw new HttpError(400, "Unesite lozinku.");
      const { error } = await c.auth.signInWithPassword({
        email: d.email!,
        password: d.password,
      });
      if (error)
        throw new HttpError(
          401,
          "Proverite email, lozinku i da li je email adresa potvrđena.",
        );
      await c.rpc("claim_my_requests");
      return NextResponse.json({ message: "Dobro došli." });
    }
    if (d.mode === "reset") {
      await c.auth.resetPasswordForEmail(d.email!, {
        redirectTo: `${origin}/auth/callback?locale=${d.locale}&next=${encodeURIComponent(localePath("/auth/oporavak", d.locale))}`,
      });
      return NextResponse.json({
        message:
          "Ako nalog postoji, na email ćete dobiti link za novu lozinku.",
      });
    }
    const {
      data: { user },
    } = await c.auth.getUser();
    if (!user) throw new HttpError(401, "Link je istekao. Zatražite novi.");
    const { error } = await c.auth.updateUser({ password: d.password! });
    if (error)
      throw new HttpError(400, "Lozinka nije promenjena. Pokušajte ponovo.");
    return NextResponse.json({ message: "Lozinka je promenjena." });
  } catch (e) {
    return failure(e);
  }
}
