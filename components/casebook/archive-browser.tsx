"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { ArchiveProject } from "@/content/casebook"
import { asset } from "@/lib/asset"
import { demoLabel } from "@/lib/project-links"

const segments: Record<string, string> = { "0": "1111110", "1": "0110000", "2": "1101101", "7": "1110000" }
const positions = [[8, 0, 40, 9], [48, 6, 9, 40], [48, 54, 9, 40], [8, 91, 40, 9], [0, 54, 9, 40], [0, 6, 9, 40], [8, 45, 40, 9]]
function Scoreboard() {
  return <div className="seven-segments" role="img" aria-label="0.217">{[..."0.217"].map((char, i) => char === "." ?
    <svg aria-hidden="true" viewBox="0 0 14 100" key={i}><rect x="2" y="90" width="10" height="10" rx="2" /></svg> :
    <svg aria-hidden="true" viewBox="0 0 58 100" key={i}>{positions.map(([x, y, width, height], j) => <rect key={j} x={x} y={y} width={width} height={height} rx="2" data-unlit={segments[char][j] === "0"} />)}</svg>
  )}</div>
}

function Specimen({ entry, compact }: { entry: ArchiveProject; compact?: boolean }) {
  return <div className={compact ? "specimen compact-specimen" : "specimen desktop-specimen"} role="group" aria-label={`${entry.title} details`}>
    <div className="specimen-media">{entry.image ? <Image unoptimized src={asset(`/casebook/${entry.image.file}.webp`)} width={entry.image.w} height={entry.image.h} loading="lazy" alt={entry.image.alt} /> : <div className="specimen-number">{entry.id === "proj-kindred" ? <Scoreboard /> : <strong>{entry.metric}</strong>}<span>{entry.metricLabel}</span></div>}</div>
    <div className="specimen-copy">
      {!compact && <><h3>{entry.title}</h3><p className="subdued">{formatDate(entry.date)}</p><p>{entry.line}</p></>}
      <p><b>{entry.result}</b></p>{entry.limit && <p className="archive-limit">{entry.limit}</p>}
      {entry.image && "credit" in entry.image && <p className="subdued">{entry.image.credit}</p>}
      <div className="actions">
        {entry.caseId && <Link className="outline" href={`/#${entry.caseId}`} prefetch={false}>Watch the case</Link>}
        {entry.links.demo && <a className="outline" href={entry.links.demo}>{demoLabel(entry.links.demo)} ↗</a>}
        {entry.links.github && <a className="outline" href={entry.links.github}>Code ↗</a>}
      </div>
    </div>
  </div>
}

const month = new Intl.DateTimeFormat("en", { year: "numeric", month: "short", timeZone: "UTC" })
function formatDate(date: string) {
  return /^\d{4}-\d{2}$/.test(date) ? month.format(new Date(`${date}-01T00:00:00Z`)) : date
}

export function ArchiveBrowser({ entries, dimensions }: { entries: ArchiveProject[]; dimensions: readonly (readonly [string, string])[] }) {
  const [filter, setFilter] = useState("all")
  const [selected, setSelected] = useState(entries[0].id)
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const query = matchMedia("(max-width: 800px)")
    const sync = () => setMobile(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    function sync() {
      const id = location.hash.slice(1)
      if (entries.some(p => p.id === id)) setSelected(id)
    }
    sync()
    addEventListener("hashchange", sync)
    return () => removeEventListener("hashchange", sync)
  }, [entries])
  const entry = entries.find(p => p.id === selected) ?? entries[0]
  const matches = (e: ArchiveProject, key: string) => key === "all" || e.tags.includes(key)
  const count = (key: string) => entries.filter(p => matches(p, key)).length
  function chooseFilter(key: string) {
    setFilter(key)
    if (!matches(entry, key)) setSelected(entries.find(p => matches(p, key))?.id ?? entry.id)
  }
  return <>
    <div className="options archive-filters" role="group" aria-label="Highlight by line of work">{dimensions.map(([key, name]) => <button key={key} type="button" className="control" aria-pressed={filter === key} onClick={() => chooseFilter(key)}>{name} <small>{count(key)}</small></button>)}</div>
    <div className="archive-filter-mobile">
      <label htmlFor="archive-category">Filter projects</label>
      <select id="archive-category" value={filter} onChange={event => chooseFilter(event.target.value)}>
        {dimensions.map(([key, name]) => <option key={key} value={key}>{name} ({count(key)})</option>)}
      </select>
      <button className="control" type="button" onClick={() => chooseFilter("all")}>Everything</button>
    </div>
    <div className="archive-grid">
      <ol className="archive-rows">{entries.map(p => <li key={p.id} id={p.id} tabIndex={-1} data-filtered={!matches(p, filter) && p.id !== entry.id}>
        <button type="button" className="archive-row" aria-pressed={p.id === entry.id} data-muted={!matches(p, filter)} onClick={() => setSelected(p.id)}>
          <span className="archive-title">{p.title} {p.badge && <small>{p.badge}</small>}</span><time dateTime={p.date}>{formatDate(p.date)}</time><span className="archive-line">{p.line}</span>
        </button>
        {mobile && p.id === entry.id && <Specimen key={entry.id} entry={entry} compact />}
      </li>)}</ol>
      {!mobile && <div className="archive-details" aria-live="polite"><Specimen key={entry.id} entry={entry} /></div>}
    </div>
    <span className="sr-only" role="status">{entry.title} selected.</span>
  </>
}
