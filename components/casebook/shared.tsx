import Link from "next/link"
import Image from "next/image"
import type { Case } from "@/content/casebook"
import { projectById } from "@/content/casebook"
import type { Project } from "@/content"
import { asset } from "@/lib/asset"
import { demoLabel } from "@/lib/project-links"
import { Evidence } from "./evidence"

export const modes = [
  { key: "casebook", label: "Casebook", href: "/" },
  { key: "brief", label: "60 seconds", href: "/60-seconds/" },
  { key: "archive", label: "Archive", href: "/archive/" },
] as const

export type Mode = (typeof modes)[number]["key"]

export function ModeLinks({ mode }: { mode: Mode }) {
  return <nav className="mode-links" aria-label="Reading modes">
    {modes.map(item => <Link key={item.key} href={item.href} aria-current={item.key === mode ? "page" : undefined} prefetch={false}>{item.label}</Link>)}
  </nav>
}

export function External({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="outline" href={href}>{children}<span aria-hidden="true">↗</span></a>
}

export function ProjectLinks({ links }: { links: Project["links"] }) {
  return <>{links.github && <External href={links.github}>Code</External>}{links.demo && <External href={links.demo}>{demoLabel(links.demo)}</External>}</>
}

export type Media = { file: string; alt: string; w: number; h: number; credit?: string }

export function Capture({ image }: { image: Media }) {
  return <Image unoptimized src={asset(`/casebook/${image.file}.webp`)} alt={image.alt} width={image.w} height={image.h} loading="lazy" />
}

export function CaseHeading({ entry, chapter, children, split = false }: { entry: Case; chapter: string; children?: React.ReactNode; split?: boolean }) {
  return <>
    <p className="chapter-label"><span>{chapter}</span><span>{projectById(entry.projectId).title}</span></p>
    {children}
    <h2 id={`${entry.id}-heading`} className="case-title">
      <span className="move-index">Obvious move {String(entry.move).padStart(2, "0")} / 05</span>
      <s>{entry.obvious}</s>{!split && <strong className="correction">{entry.fix}</strong>}
    </h2>
  </>
}

export function EvidenceButton({ entry, image }: { entry: Case; image?: Media }) {
  const p = projectById(entry.projectId)
  return <Evidence id={entry.id} title={p.title}>
    <p className="evidence-intro">{p.oneLine}</p>
    <h3>Decision</h3><p>{entry.decision}</p>
    <h3>Method</h3><p>{entry.method}</p>
    {entry.table && <div className="table-wrap"><table><thead><tr>{entry.table.headings.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{entry.table.rows.map(row => <tr key={row[0]}>{row.map((val, i) => i ? <td key={i}>{val}</td> : <th scope="row" key={i}>{val}</th>)}</tr>)}</tbody></table></div>}
    <h3>Measured</h3><p>{entry.result}</p>
    <h3>Limits and checks</h3><p>{entry.limit}</p>
    <ul>{p.highlights.filter(x => x !== entry.result && x !== entry.limit).map(x => <li key={x}>{x}</li>)}</ul>
    {image && <figure className="capture"><Capture image={image} />{image.credit && <figcaption>{image.credit}</figcaption>}</figure>}
    <div className="actions"><ProjectLinks links={p.links} /></div>
  </Evidence>
}

export function Receipt({ entry, image }: { entry: Case; image?: Media }) {
  return <div className="receipt">
    <div><p className="eyebrow">Result</p><strong className="metric">{entry.metric}</strong><p>{entry.result}</p></div>
    <div className="limit"><p className="eyebrow">Limit</p><p>{entry.limit}</p><p className="decision"><b>Decision / what changed</b> {entry.decision}</p></div>
    <div className="receipt-actions"><EvidenceButton entry={entry} image={image} /><ProjectLinks links={projectById(entry.projectId).links} /></div>
  </div>
}
