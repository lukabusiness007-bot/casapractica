import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { splitLocale } from "./lib/i18n/routing";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);
  // Serbian keeps its established URLs; prefixed aliases redirect to one canonical URL.
  if (/^\/sr(?:\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  requestHeaders.set("x-site-path", path);
  const url = request.nextUrl.clone();
  url.pathname = path;
  const makeResponse = () =>
    locale !== "sr"
      ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
      : NextResponse.next({ request: { headers: requestHeaders } });
  let response = makeResponse();
  const needsSession =
    /^\/(nalog|admin|prijava|registracija|klub|api|auth)(\/|$)/.test(path);
  if (
    needsSession &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (values) => {
            values.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            requestHeaders.set("cookie", request.cookies.toString());
            response = makeResponse();
            values.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    await client.auth.getUser();
  }
  if (/^\/(nalog|admin|prijava|registracija|auth)(\/|$)/.test(path))
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next|images/|brand/|icon.svg|favicon.ico|robots.txt|sitemap.xml|opengraph-image).*)",
  ],
};
