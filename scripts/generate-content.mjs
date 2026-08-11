import fs from "fs"
import path from "path"
import process from "process"
import { z } from "zod"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const xlsx = require("xlsx");

const ROOT = process.cwd()
const CONTENT_XLSX_PATH = path.join(ROOT, "content", "content.xlsx")
const GENERATED_DIR = path.join(ROOT, "content", "generated")
const GENERATED_JSON_PATH = path.join(GENERATED_DIR, "content.json")
const PUBLIC_DIR = path.join(ROOT, "public")
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml")
const ROBOTS_PATH = path.join(PUBLIC_DIR, "robots.txt")

const ROOT_TO_SHEET_MAP = {
  profile: "Profile",
  socialLinks: "SocialLinks",
  skills: "Skills",
  techStack: "TechStack",
  featuredProjects: "FeaturedProjects",
  projects: "Projects",
  experience: "Experience",
  certificates: "Certificates",
  contact: "Contact",
  experienceStats: "ExperienceStats",
  navItems: "NavItems",
  seo: "Seo",
}

const TRUE_VALUES = new Set(["true", "t", "yes", "y", "1"])
const FALSE_VALUES = new Set(["false", "f", "no", "n", "0"])

function stringFromCell(value) {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value).trim()
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  return String(value).trim()
}

function parseRequiredString(value, fieldName, ctx) {
  const str = stringFromCell(value)
  if (!str) {
    throw new Error(`${ctx}: "${fieldName}" is required but was empty.`)
  }
  return str
}

function parseOptionalString(value) {
  const str = stringFromCell(value)
  return str || undefined
}

function parseSemicolonArray(value) {
  const str = stringFromCell(value)
  if (!str) return []
  return str
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseBooleanValue(value, fieldName, ctx) {
  if (typeof value === "boolean") return value
  const str = stringFromCell(value).toLowerCase()
  if (!str) return undefined
  if (TRUE_VALUES.has(str)) return true
  if (FALSE_VALUES.has(str)) return false
  throw new Error(
    `${ctx}: "${fieldName}" must be TRUE or FALSE (or empty), but got "${stringFromCell(value)}".`,
  )
}

function parseOrder(value, ctx) {
  const str = stringFromCell(value)
  if (!str) return Number.MAX_SAFE_INTEGER
  const num = Number(str)
  if (!Number.isFinite(num)) {
    throw new Error(`${ctx}: "order" must be a number, but got "${stringFromCell(value)}".`)
  }
  return num
}

function sortByOrder(items) {
  return [...items].sort((a, b) => {
    const ao = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER
    const bo = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER
    return ao - bo
  })
}

function getWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `[content.xlsx] File not found at "${filePath}". Make sure /content/content.xlsx exists (see README).`,
    )
  }
  try {
    return xlsx.readFile(filePath)
  } catch (err) {
    throw new Error(
      `[content.xlsx] Failed to read Excel file. Ensure it is a valid .xlsx file.\n\nUnderlying error: ${
        err && err.message ? err.message : String(err)
      }`,
    )
  }
}

function getRequiredSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(
      `[content.xlsx] Missing required sheet "${sheetName}". Add a sheet with this exact name (see README schema).`,
    )
  }
  return sheet
}

function sheetToRows(sheet) {
  return xlsx.utils.sheet_to_json(sheet, { defval: "" })
}

function requireColumns(sheetName, rows, requiredColumns) {
  if (!rows.length) return
  const present = new Set(Object.keys(rows[0]))
  const missing = requiredColumns.filter((col) => !present.has(col))
  if (missing.length > 0) {
    throw new Error(
      `[content.xlsx] Sheet "${sheetName}" is missing required column(s): ${missing.join(
        ", ",
      )}.\nCheck the header row for typos. Column names are case-sensitive.`,
    )
  }
}

function validateRequiredSheets(workbook) {
  const missing = []
  for (const sheetName of Object.values(ROOT_TO_SHEET_MAP)) {
    if (!workbook.Sheets[sheetName]) {
      missing.push(sheetName)
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `[content.xlsx] Missing required sheet(s): ${missing.join(
        ", ",
      )}.\nAdd sheet(s) with these exact names (see README schema).`,
    )
  }
}

const ProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  summaryBullets: z.array(z.string().min(1)).min(1),
  heroTaglines: z.array(z.string().min(1)).min(1),
  heroPrimaryCtaLabel: z.string().min(1),
  heroPrimaryCtaHref: z.string().min(1),
  heroSecondaryCtaLabel: z.string().min(1),
  heroSecondaryCtaHref: z.string().min(1),
  resumeLabel: z.string().min(1),
  resumeUrl: z.string().min(1),
  footerTagline: z.string().optional(),
  handle: z.string().optional(),
  statusText: z.string().optional(),
  avatarUrl: z.string().optional(),
  miniAvatarUrl: z.string().optional(),
})

const SocialLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  icon: z.string().min(1),
  order: z.number().optional(),
})

const SkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().optional(),
})

const FeaturedProjectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  stack: z.array(z.string().min(1)).min(1),
  githubUrl: z.string().min(1).optional(),
  liveUrl: z.string().min(1).optional(),
  order: z.number().optional(),
})

const ProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  oneLine: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  stack: z.array(z.string().min(1)).min(1),
  links: z.object({
    github: z.string().min(1).optional(),
    demo: z.string().min(1).optional(),
  }),
  highlights: z.array(z.string().min(1)).min(1),
  date: z.string().min(1),
  order: z.number().optional(),
  projectImageUrl: z.string().min(1).optional(),
})

const ExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  dates: z.string().min(1),
  location: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
  techStack: z.array(z.string().min(1)).min(1),
  order: z.number().optional(),
})

const CertificateSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  date: z.string().min(1),
  credentialUrl: z.string().min(1).optional(),
  skillsTags: z.array(z.string().min(1)).min(1),
  order: z.number().optional(),
})

const ContactSchema = z.object({
  email: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().min(1),
  socials: z.array(SocialLinkSchema),
})

const ExperienceStatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().min(1),
  order: z.number().optional(),
})

const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  visible: z.boolean().default(true),
  order: z.number().optional(),
})

const SeoSchema = z.object({
  siteTitle: z.string().min(1),
  siteDescription: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(1),
  twitterHandle: z.string().optional(),
  ogImage: z.string().min(1),
})

const ContentSchema = z.object({
  profile: ProfileSchema,
  socialLinks: z.array(SocialLinkSchema),
  skills: z.array(SkillSchema),
  techStack: z.array(z.string().min(1)),
  featuredProjects: z.array(FeaturedProjectSchema),
  projects: z.array(ProjectSchema),
  experience: z.array(ExperienceSchema),
  certificates: z.array(CertificateSchema),
  contact: ContactSchema,
  experienceStats: z.array(ExperienceStatSchema),
  navItems: z.array(NavItemSchema),
  seo: SeoSchema,
})

function formatZodError(error) {
  if (!error || !error.errors) return error?.message || String(error)
  return error.errors
    .map((issue) => {
      const path = issue.path || []
      const root = path[0]
      const sheet = ROOT_TO_SHEET_MAP[root] || root || "Unknown sheet"
      const fieldPath = path.join(".")
      const arrayIndex = path.find((p) => typeof p === "number")
      const rowInfo =
        typeof arrayIndex === "number" ? ` (row ${arrayIndex + 2} in sheet "${sheet}")` : ""
      return `[${sheet}] ${fieldPath}${rowInfo}: ${issue.message}`
    })
    .join("\n")
}

function buildContentFromWorkbook(workbook) {
  validateRequiredSheets(workbook)

  const profileSheet = getRequiredSheet(workbook, "Profile")
  const profileRows = sheetToRows(profileSheet)
  if (!profileRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Profile" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Profile", profileRows, [
    "name",
    "headline",
    "location",
    "summaryBullets",
    "heroTaglines",
    "heroPrimaryCtaLabel",
    "heroPrimaryCtaHref",
    "heroSecondaryCtaLabel",
    "heroSecondaryCtaHref",
    "resumeLabel",
    "resumeUrl",
  ])
  const profileRow = profileRows[0]
  const profile = {
    name: parseRequiredString(profileRow.name, "name", "[Profile]"),
    headline: parseRequiredString(profileRow.headline, "headline", "[Profile]"),
    location: parseRequiredString(profileRow.location, "location", "[Profile]"),
    summaryBullets: parseSemicolonArray(profileRow.summaryBullets),
    heroTaglines: parseSemicolonArray(profileRow.heroTaglines),
    heroPrimaryCtaLabel: parseRequiredString(
      profileRow.heroPrimaryCtaLabel,
      "heroPrimaryCtaLabel",
      "[Profile]",
    ),
    heroPrimaryCtaHref: parseRequiredString(
      profileRow.heroPrimaryCtaHref,
      "heroPrimaryCtaHref",
      "[Profile]",
    ),
    heroSecondaryCtaLabel: parseRequiredString(
      profileRow.heroSecondaryCtaLabel,
      "heroSecondaryCtaLabel",
      "[Profile]",
    ),
    heroSecondaryCtaHref: parseRequiredString(
      profileRow.heroSecondaryCtaHref,
      "heroSecondaryCtaHref",
      "[Profile]",
    ),
    resumeLabel: parseRequiredString(profileRow.resumeLabel, "resumeLabel", "[Profile]"),
    resumeUrl: parseRequiredString(profileRow.resumeUrl, "resumeUrl", "[Profile]"),
    footerTagline: parseOptionalString(profileRow.footerTagline),
    handle: parseOptionalString(profileRow.handle),
    statusText: parseOptionalString(profileRow.statusText),
    avatarUrl: parseOptionalString(profileRow.avatarUrl),
    miniAvatarUrl: parseOptionalString(profileRow.miniAvatarUrl),
  }

  const socialSheet = getRequiredSheet(workbook, "SocialLinks")
  const socialRows = sheetToRows(socialSheet)
  if (!socialRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "SocialLinks" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("SocialLinks", socialRows, ["name", "url", "icon"])
  const socialLinks = sortByOrder(
    socialRows.map((row, index) => ({
      name: parseRequiredString(row.name, "name", `[SocialLinks row ${index + 2}]`),
      url: parseRequiredString(row.url, "url", `[SocialLinks row ${index + 2}]`),
      icon: parseRequiredString(row.icon, "icon", `[SocialLinks row ${index + 2}]`),
      order: parseOrder(row.order, `[SocialLinks row ${index + 2}]`),
    })),
  )

  const skillsSheet = getRequiredSheet(workbook, "Skills")
  const skillsRows = sheetToRows(skillsSheet)
  if (!skillsRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Skills" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Skills", skillsRows, ["name", "category"])
  const skills = sortByOrder(
    skillsRows.map((row, index) => ({
      name: parseRequiredString(row.name, "name", `[Skills row ${index + 2}]`),
      category: parseRequiredString(row.category, "category", `[Skills row ${index + 2}]`),
      icon: parseOptionalString(row.icon),
      order: parseOrder(row.order, `[Skills row ${index + 2}]`),
    })),
  )

  const techStackSheet = getRequiredSheet(workbook, "TechStack")
  const techStackRows = sheetToRows(techStackSheet)
  if (!techStackRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "TechStack" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("TechStack", techStackRows, ["name"])
  const techStackItems = sortByOrder(
    techStackRows.map((row, index) => ({
      name: parseRequiredString(row.name, "name", `[TechStack row ${index + 2}]`),
      order: parseOrder(row.order, `[TechStack row ${index + 2}]`),
    })),
  )
  const techStack = techStackItems.map((item) => item.name)

  const featuredSheet = getRequiredSheet(workbook, "FeaturedProjects")
  const featuredRows = sheetToRows(featuredSheet)
  if (!featuredRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "FeaturedProjects" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("FeaturedProjects", featuredRows, ["title", "summary", "tags", "stack"])
  const featuredProjects = sortByOrder(
    featuredRows.map((row, index) => ({
      title: parseRequiredString(row.title, "title", `[FeaturedProjects row ${index + 2}]`),
      summary: parseRequiredString(row.summary, "summary", `[FeaturedProjects row ${index + 2}]`),
      tags: parseSemicolonArray(row.tags),
      stack: parseSemicolonArray(row.stack),
      githubUrl: parseOptionalString(row.githubUrl),
      liveUrl: parseOptionalString(row.liveUrl),
      order: parseOrder(row.order, `[FeaturedProjects row ${index + 2}]`),
    })),
  )

  const projectsSheet = getRequiredSheet(workbook, "Projects")
  const projectsRows = sheetToRows(projectsSheet)
  if (!projectsRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Projects" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Projects", projectsRows, [
    "id",
    "title",
    "oneLine",
    "description",
    "tags",
    "stack",
    "highlights",
    "date",
  ])
  const projects = sortByOrder(
    projectsRows.map((row, index) => ({
      id: parseRequiredString(row.id, "id", `[Projects row ${index + 2}]`),
      title: parseRequiredString(row.title, "title", `[Projects row ${index + 2}]`),
      oneLine: parseRequiredString(row.oneLine, "oneLine", `[Projects row ${index + 2}]`),
      description: parseRequiredString(
        row.description,
        "description",
        `[Projects row ${index + 2}]`,
      ),
      tags: parseSemicolonArray(row.tags),
      stack: parseSemicolonArray(row.stack),
      // The sheet template documents links_github / links_demo, but only
      // github / demo were ever read — so rows filled in per those template
      // instructions silently produced an empty links object. Accept both
      // spellings, with github / demo winning when a row has both.
      links: {
        github: parseOptionalString(row.github) ?? parseOptionalString(row.links_github),
        demo: parseOptionalString(row.demo) ?? parseOptionalString(row.links_demo),
      },
      highlights: parseSemicolonArray(row.highlights),
      date: parseRequiredString(row.date, "date", `[Projects row ${index + 2}]`),
      order: parseOrder(row.order, `[Projects row ${index + 2}]`),
      projectImageUrl: parseOptionalString(row.projectImageUrl),
    })),
  )

  const experienceSheet = getRequiredSheet(workbook, "Experience")
  const experienceRows = sheetToRows(experienceSheet)
  if (!experienceRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Experience" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Experience", experienceRows, [
    "company",
    "role",
    "dates",
    "location",
    "bullets",
    "techStack",
  ])
  const experience = sortByOrder(
    experienceRows.map((row, index) => ({
      company: parseRequiredString(row.company, "company", `[Experience row ${index + 2}]`),
      role: parseRequiredString(row.role, "role", `[Experience row ${index + 2}]`),
      dates: parseRequiredString(row.dates, "dates", `[Experience row ${index + 2}]`),
      location: parseRequiredString(row.location, "location", `[Experience row ${index + 2}]`),
      bullets: parseSemicolonArray(row.bullets),
      techStack: parseSemicolonArray(row.techStack),
      order: parseOrder(row.order, `[Experience row ${index + 2}]`),
    })),
  )

  const certificatesSheet = getRequiredSheet(workbook, "Certificates")
  const certificatesRows = sheetToRows(certificatesSheet)
  if (!certificatesRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Certificates" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Certificates", certificatesRows, ["title", "issuer", "date", "skillsTags"])
  const certificates = sortByOrder(
    certificatesRows.map((row, index) => ({
      title: parseRequiredString(row.title, "title", `[Certificates row ${index + 2}]`),
      issuer: parseRequiredString(row.issuer, "issuer", `[Certificates row ${index + 2}]`),
      date: parseRequiredString(row.date, "date", `[Certificates row ${index + 2}]`),
      credentialUrl: parseOptionalString(row.credentialUrl),
      skillsTags: parseSemicolonArray(row.skillsTags),
      order: parseOrder(row.order, `[Certificates row ${index + 2}]`),
    })),
  )

  const contactSheet = getRequiredSheet(workbook, "Contact")
  const contactRows = sheetToRows(contactSheet)
  if (!contactRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Contact" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Contact", contactRows, ["email", "location", "availability"])
  const contactRow = contactRows[0]
  const contact = {
    email: parseRequiredString(contactRow.email, "email", "[Contact]"),
    location: parseRequiredString(contactRow.location, "location", "[Contact]"),
    availability: parseRequiredString(contactRow.availability, "availability", "[Contact]"),
    socials: socialLinks,
  }

  const statsSheet = getRequiredSheet(workbook, "ExperienceStats")
  const statsRows = sheetToRows(statsSheet)
  if (!statsRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "ExperienceStats" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("ExperienceStats", statsRows, ["label", "value", "description"])
  const experienceStats = sortByOrder(
    statsRows.map((row, index) => ({
      label: parseRequiredString(row.label, "label", `[ExperienceStats row ${index + 2}]`),
      value: parseRequiredString(row.value, "value", `[ExperienceStats row ${index + 2}]`),
      description: parseRequiredString(
        row.description,
        "description",
        `[ExperienceStats row ${index + 2}]`,
      ),
      order: parseOrder(row.order, `[ExperienceStats row ${index + 2}]`),
    })),
  )

  const navSheet = getRequiredSheet(workbook, "NavItems")
  const navRows = sheetToRows(navSheet)
  if (!navRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "NavItems" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("NavItems", navRows, ["label", "href"])
  const navItems = sortByOrder(
    navRows.map((row, index) => ({
      label: parseRequiredString(row.label, "label", `[NavItems row ${index + 2}]`),
      href: parseRequiredString(row.href, "href", `[NavItems row ${index + 2}]`),
      visible:
        parseBooleanValue(row.visible, "visible", `[NavItems row ${index + 2}]`) ?? true,
      order: parseOrder(row.order, `[NavItems row ${index + 2}]`),
    })),
  )

  const seoSheet = getRequiredSheet(workbook, "Seo")
  const seoRows = sheetToRows(seoSheet)
  if (!seoRows.length) {
    throw new Error(
      `[content.xlsx] Sheet "Seo" must have at least one data row starting in row 2.`,
    )
  }
  requireColumns("Seo", seoRows, ["siteTitle", "siteDescription", "keywords", "ogImage"])
  const seoRow = seoRows[0]
  const seo = {
    siteTitle: parseRequiredString(seoRow.siteTitle, "siteTitle", "[Seo]"),
    siteDescription: parseRequiredString(
      seoRow.siteDescription,
      "siteDescription",
      "[Seo]",
    ),
    keywords: parseSemicolonArray(seoRow.keywords),
    twitterHandle: parseOptionalString(seoRow.twitterHandle),
    ogImage: parseRequiredString(seoRow.ogImage, "ogImage", "[Seo]"),
  }

  const content = {
    profile,
    socialLinks,
    skills,
    techStack,
    featuredProjects,
    projects,
    experience,
    certificates,
    contact,
    experienceStats,
    navItems,
    seo,
  }

  const parsed = ContentSchema.parse(content)
  return parsed
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
}

function buildSiteUrl(pathname) {
  const baseEnv = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const base = baseEnv.replace(/\/+$/, "")
  if (!pathname || pathname === "/") return `${base}/`
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}

function generateSitemapAndRobots(content) {
  ensureDir(PUBLIC_DIR)

  const baseRoutes = ["/", "/experience", "/projects", "/certificates", "/contact"]
  const projectRoutes = (content.projects || []).map((project) => `/projects/${project.id}`)
  const allRoutes = Array.from(new Set([...baseRoutes, ...projectRoutes]))

  const lastmod = new Date().toISOString()

  const sitemapXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    allRoutes
      .map(
        (route) =>
          `  <url>\n    <loc>${buildSiteUrl(route)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
      )
      .join("\n") +
    "\n</urlset>\n"

  fs.writeFileSync(SITEMAP_PATH, sitemapXml, "utf8")

  const robotsTxt = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${buildSiteUrl("/sitemap.xml")}`,
    "",
  ].join("\n")

  fs.writeFileSync(ROBOTS_PATH, robotsTxt, "utf8")
}

function main() {
  try {
    const workbook = getWorkbook(CONTENT_XLSX_PATH)
    const content = buildContentFromWorkbook(workbook)
    writeJsonFile(GENERATED_JSON_PATH, content)
    generateSitemapAndRobots(content)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "\n[generate-content] Validation failed while parsing content from content.xlsx:\n",
      )
      console.error(formatZodError(error))
    } else {
      console.error("\n[generate-content] Failed to generate content from content.xlsx.\n")
      if (error && error.message) {
        console.error(error.message)
      } else {
        console.error(String(error))
      }
    }
    console.error(
      "\nFix the Excel file (sheets, columns, or cell values) and run `npm run generate:content` again.",
    )
    process.exit(1)
  }
}

main()