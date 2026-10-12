import { resolveSiteUrl } from "@/lib/site-url";
import { isLocale, localePath } from "@/lib/i18n/routing";
import { NextResponse } from "next/server";
import { authClient, configured } from "@/lib/supabase";
import { safeReturn } from "@/lib/validation";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const language = url.searchParams.get("locale") || "sr";
  const locale = isLocale(language) ? language : "sr";
  const origin = resolveSiteUrl(process.env, url.origin);
  if (configured()) {
    const c = await authClient();
    const code = url.searchParams.get("code");
    if (code) {
      const { error } = await c.auth.exchangeCodeForSession(code);
      if (!error) {
        await c.rpc("claim_my_requests");
        return NextResponse.redirect(
          new URL(
            localePath(safeReturn(url.searchParams.get("next")), locale),
            origin,
          ),
        );
      }
    }
  }
  return NextResponse.redirect(
    new URL(localePath("/prijava?error=callback", locale), origin),
  );
}
