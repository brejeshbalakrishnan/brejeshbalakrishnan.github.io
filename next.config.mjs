import { fileURLToPath } from "node:url"
const isGithubActions = process.env.GITHUB_ACTIONS === "true"

const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split("/")[1] : ""
const explicitBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

// User/organization sites (repos named <owner>.github.io) are served from the
// domain root and must not get a basePath; project pages keep /<repo>.
const isRootSite = repoName.endsWith(".github.io")
const computedBasePath =
  explicitBasePath || (isGithubActions && repoName && !isRootSite ? `/${repoName}` : "")

const nextConfig = {
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: computedBasePath || undefined,
  assetPrefix: computedBasePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: computedBasePath || "",
  },
}

export default nextConfig
