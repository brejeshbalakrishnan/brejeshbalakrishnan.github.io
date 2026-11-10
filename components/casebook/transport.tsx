"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Menu, Pause, Play } from "lucide-react"
import type { Mode } from "./shared"

type Chapter = { id: string; number: string; label: string; sub: string; color: string }
const motionQuery = "(prefers-reduced-motion: reduce)"

export function Transport({ mode, chapters }: { mode: Mode; chapters: readonly Chapter[] }) {
  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const [motion, setMotion] = useState(true)
  const [systemReduced, setSystemReduced] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    const query = matchMedia(motionQuery)
    const sync = () => {
      const enabled = !query.matches && sessionStorage.getItem("casebook-motion") !== "off"
      setSystemReduced(query.matches)
      setMotion(enabled)
      document.documentElement.dataset.motion = enabled ? "on" : "off"
    }
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (mode !== "casebook") return
    const sections = chapters.map(c => document.getElementById(c.id))
    let frame = 0
    const read = () => {
      frame = 0
      const line = innerHeight * 0.4
      let active = 0
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        if (section && section.getBoundingClientRect().top <= line) active = i
      }
      setCurrent(active)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(read) }
    schedule()
    addEventListener("scroll", schedule, { passive: true })
    addEventListener("resize", schedule)
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", schedule); removeEventListener("resize", schedule) }
  }, [chapters, mode])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus() }
    }
    const first = menu.current?.querySelector<HTMLAnchorElement>("a[aria-current]") ?? menu.current?.querySelector<HTMLAnchorElement>("a")
    first?.focus()
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey) }
  }, [open])

  function toggleMotion() {
    if (systemReduced) return
    const enabled = !motion
    sessionStorage.setItem("casebook-motion", enabled ? "on" : "off")
    document.documentElement.dataset.motion = enabled ? "on" : "off"
    setMotion(enabled)
  }

  const chapter = chapters[current]
  const label = mode === "casebook" ? (current === 0 || chapter.number === "—" ? chapter.label : `${chapter.number} · ${chapter.label}`) : mode === "brief" ? "60-second path" : "The archive"
  const sub = mode === "casebook" ? chapter.sub : mode === "brief" ? "Role, three cases, experience" : "15 projects and the record"

  return <nav ref={nav} className="transport" aria-label="Casebook transport">
    <button type="button" className="transport-current" ref={trigger} aria-expanded={open} aria-controls="chapter-menu" onClick={() => setOpen(v => !v)}>
      <span className="ticks" aria-hidden="true">{chapters.map((c, i) => <i key={c.id} data-current={mode === "casebook" && current === i} style={{ background: c.color }} />)}</span>
      <Menu className="mobile-menu-icon" size={17} aria-hidden="true" />
      <span className="transport-label"><b>{label}</b><small>{sub}</small></span>
    </button>
    <div ref={menu} id="chapter-menu" className="chapter-menu" hidden={!open}>
      <p className="eyebrow">Jump to</p>
      {chapters.map((c, i) => <Link prefetch={false} key={c.id} href={mode === "casebook" ? `#${c.id}` : `/#${c.id}`} aria-current={mode === "casebook" && current === i ? "location" : undefined} onClick={() => {
        setOpen(false)
        if (mode === "casebook") requestAnimationFrame(() => document.getElementById(c.id)?.focus({ preventScroll: true }))
      }}>
        <i style={{ background: c.color }} aria-hidden="true" /><small>{c.number}</small><span>{c.label}</span>
      </Link>)}
    </div>
    <Link href={mode === "brief" ? "/" : "/60-seconds/"} prefetch={false} aria-label={mode === "brief" ? "60 seconds, current mode. Back to Casebook" : "60 seconds"} data-selected={mode === "brief"}>60 sec</Link>
    <Link href={mode === "archive" ? "/" : "/archive/"} prefetch={false} aria-label={mode === "archive" ? "Archive, current mode. Back to Casebook" : "Archive"} data-selected={mode === "archive"}>Archive</Link>
    <button className="motion-toggle" type="button" disabled={systemReduced} aria-label={systemReduced ? "Motion off (system preference)" : "Scroll motion"} aria-pressed={motion} onClick={toggleMotion}>
      {motion ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />} <span>Motion</span>
    </button>
  </nav>
}
