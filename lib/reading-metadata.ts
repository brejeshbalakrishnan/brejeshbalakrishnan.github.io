import type { Metadata } from "next"
import { profile, seo } from "@/content"
import { buildSiteUrl } from "./site-url"

export function readingMetadata(title: string, description: string, path: string): Metadata {
  const url = buildSiteUrl(path)
  return { title, description, alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Edge Cases", title: `${title} | ${profile.name}`, description, url, images: [{ url: buildSiteUrl(seo.ogImage), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [buildSiteUrl(seo.ogImage)] } }
}
