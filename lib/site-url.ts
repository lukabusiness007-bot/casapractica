type SiteEnvironment = Record<string, string | undefined>;

export function resolveSiteUrl(
  env: SiteEnvironment = process.env,
  fallback = "http://localhost:3000",
) {
  const deploymentHost =
    env.VERCEL_ENV === "preview"
      ? env.VERCEL_URL
      : env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  const configured = env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = new URL(
    configured || (deploymentHost ? `https://${deploymentHost}` : fallback),
  );
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Site URL must be an HTTP(S) origin without credentials.");
  return url.origin;
}

export function trustedSiteOrigins(env: SiteEnvironment = process.env) {
  const origins = new Set([resolveSiteUrl(env)]);
  if (env.VERCEL_URL)
    origins.add(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: `https://${env.VERCEL_URL}` }),
    );
  return origins;
}

export function isPublicProductionSite(env: SiteEnvironment = process.env) {
  const url = new URL(resolveSiteUrl(env));
  return (
    (!env.VERCEL_ENV || env.VERCEL_ENV === "production") &&
    url.protocol === "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  );
}
