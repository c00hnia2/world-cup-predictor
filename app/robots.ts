import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Trasy prywatne/za logowaniem nie powinny trafiać do indeksu.
      disallow: ["/admin", "/leagues", "/auth", "/verify-email"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
