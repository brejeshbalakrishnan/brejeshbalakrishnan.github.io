const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brejeshbalakrishnan.github.io"

export function getSiteUrl(): string {
  return SITE_URL
}

export function buildSiteUrl(pathname: string = "/"): string {
  const base = SITE_URL.replace(/\/+$/, "")
  if (!pathname || pathname === "/") return `${base}/`
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}
