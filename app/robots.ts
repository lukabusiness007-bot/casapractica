import type { MetadataRoute } from "next";
import { productionSite, siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(productionSite
        ? { allow: "/", disallow: ["/api/", "/auth/callback"] }
        : { disallow: "/" }),
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
