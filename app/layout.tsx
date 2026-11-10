import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { profile, seo, socialLinks } from "@/content"
import { buildSiteUrl } from "@/lib/site-url"
import { asset } from "@/lib/asset"
import "./casebook.css"

const archivo = localFont({ src: "../public/fonts/archivo.woff2", weight: "100 900", variable: "--archivo", display: "swap", adjustFontFallback: false, declarations: [{ prop: "font-stretch", value: "62% 125%" }] })

export const viewport: Viewport = { themeColor: "#0e0e0e", viewportFit: "cover" }

export const metadata: Metadata = {
  metadataBase: new URL(buildSiteUrl("/")),
  title: { default: seo.siteTitle, template: `%s | ${profile.name}` },
  description: seo.siteDescription,
  keywords: seo.keywords,
  alternates: { canonical: buildSiteUrl("/") },
  openGraph: { type: "website", siteName: "Edge Cases", url: buildSiteUrl("/"), title: seo.siteTitle, description: seo.siteDescription, images: [{ url: buildSiteUrl(seo.ogImage), width: 1200, height: 630, alt: "AI that knows when it’s wrong. Brejesh Balakrishnan’s casebook." }] },
  twitter: { card: "summary_large_image", images: [buildSiteUrl(seo.ogImage)] },
  icons: { icon: asset("/icon.svg"), apple: asset("/apple-icon.png") },
}

const person = {
  "@context": "https://schema.org", "@type": "Person", "@id": buildSiteUrl("/#brejesh"), url: buildSiteUrl("/"),
  name: profile.name, jobTitle: profile.headline, image: buildSiteUrl(profile.avatarUrl),
  sameAs: socialLinks.filter(link => link.url.startsWith("https:")).map(link => link.url),
  address: { "@type": "PostalAddress", addressLocality: profile.location },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={archivo.variable}>
    <body>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      {children}
    </body>
  </html>
}
