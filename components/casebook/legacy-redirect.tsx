import Link from "next/link"
import { asset } from "@/lib/asset"
import { buildSiteUrl } from "@/lib/site-url"

export function redirectMetadata(path: string) {
  return { robots: { index: false, follow: true }, alternates: { canonical: buildSiteUrl(path.split("#")[0]) } }
}

export function LegacyRedirect({ path }: { path: string }) {
  return <main id="main-content" tabIndex={-1} className="tone-bone reading">
    <meta httpEquiv="refresh" content={`0; url=${asset(path)}`} />
    <div className="inner"><h1>This page has moved.</h1><p><Link className="text-link" href={path}>Continue to the portfolio</Link></p></div>
  </main>
}
