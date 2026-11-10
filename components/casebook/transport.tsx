"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Menu } from "lucide-react"
import { ModeLink, type Mode } from "./route-links"

type Chapter = { id: string; number: string; label: string; sub: string; color: string }
const motionQuery = "(prefers-reduced-motion: reduce)"

export function Transport({ mode, chapters }: { mode: Mode; chapters: readonly Chapter[] }) {
  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const [motion, setMotion] = useState(true)
  const [systemReduced, setSystemReduced] = useState(false)
  const [reading, setReading] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    const query = matchMedia(motionQuery)
    const sync = () => {
      const enabled = !query.matches && document.documentElement.dataset.motion !== "off"
      setSystemReduced(query.matches)
      setMotion(enabled)
    }
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    const dock = nav.current
    if (!dock) return
    const reader = document.getElementById("main-content")
    const root = document.documentElement
    const measure = () => root.style.setProperty("--transport-height", `${Math.ceil(dock.getBoundingClientRect().height)}px`)
    const observer = new ResizeObserver(measure)
    observer.observe(dock)
    measure()
    let frame = 0
    const revealFocus = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || dock.contains(target) || target.closest("dialog")) return
      if (!target.matches('a, button, summary, input, select, textarea, [contenteditable="true"], [tabindex="0"]')) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (document.activeElement !== target) return
        const box = target.getBoundingClientRect()
        const bar = dock.getBoundingClientRect()
        if (box.bottom > bar.top - 8 && box.top < innerHeight && box.left < bar.right && box.right > bar.left) {
          const scrollport = getComputedStyle(dock).position === "fixed" ? window : reader
          scrollport?.scrollBy({ top: box.bottom - bar.top + 12, behavior: "instant" })
        }
      })
    }
    document.addEventListener("focusin", revealFocus)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener("focusin", revealFocus) }
  }, [])

  useEffect(() => {
    const reader = document.getElementById("main-content")
    const sections = mode === "casebook" ? chapters.map(c => document.getElementById(c.id)) : []
    let frame = 0
    const read = () => {
      frame = 0
      if (mode !== "casebook") {
        setReading(Math.max(window.scrollY, reader?.scrollTop ?? 0) > 80)
        return
      }
      const line = Math.min(innerHeight, reader?.clientHeight ?? innerHeight) * 0.4
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
    reader?.addEventListener("scroll", schedule, { passive: true })
    addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener("scroll", schedule)
      reader?.removeEventListener("scroll", schedule)
      removeEventListener("resize", schedule)
    }
  }, [chapters, mode])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus() }
    }
    const first = menu.current?.querySelector<HTMLAnchorElement>('a[aria-current="location"]') ?? menu.current?.querySelector<HTMLAnchorElement>("a")
    first?.focus()
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey) }
  }, [open])

  function toggleMotion() {
    if (systemReduced) return
    const chapter = mode === "casebook" ? document.getElementById(chapters[current].id) : null
    const before = chapter?.getBoundingClientRect().top
    const enabled = !motion
    try { localStorage.setItem("casebook-motion", enabled ? "on" : "off") } catch {}
    document.documentElement.dataset.motion = enabled ? "on" : "off"
    setMotion(enabled)
    if (chapter && before !== undefined && nav.current && getComputedStyle(nav.current).position === "fixed") {
      const offset = chapter.classList.contains("scene") ? Math.max(0, before) : before
      window.scrollBy({ top: chapter.getBoundingClientRect().top - offset, behavior: "instant" })
    }
  }

  const chapter = chapters[current]
  const label = mode === "casebook" ? (current === 0 || chapter.number === "—" ? chapter.label : `${chapter.number} · ${chapter.label}`) : mode === "brief" ? "60-second path" : "The archive"
  const sub = mode === "casebook" ? chapter.sub : mode === "brief" ? "Role, three cases, experience" : "15 projects and the record"

  return <nav ref={nav} className="transport" aria-label="Casebook transport" data-quiet={mode !== "casebook" && reading && !open || undefined}>
    <button type="button" className="transport-current" ref={trigger} aria-label={`${label}, chapters and reading modes`} aria-expanded={open} aria-controls="chapter-menu" onClick={() => setOpen(v => !v)}>
      <span className="ticks" aria-hidden="true">{chapters.map((c, i) => <i key={c.id} data-current={mode === "casebook" && current === i} style={{ background: c.color }} />)}</span>
      <Menu className="mobile-menu-icon" size={17} aria-hidden="true" />
      <span className="transport-label" key={label}><b>{label}</b><small>{sub}</small></span>
    </button>
    <div ref={menu} id="chapter-menu" className="chapter-menu" hidden={!open}>
      <p className="eyebrow">Jump to</p>
      {chapters.map((c, i) => <Link prefetch={false} scroll={mode !== "casebook"} key={c.id} href={mode === "casebook" ? `#${c.id}` : `/#${c.id}`} aria-current={mode === "casebook" && current === i ? "location" : undefined} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        setOpen(false)
        if (mode !== "casebook") return
        requestAnimationFrame(() => {
          const section = document.getElementById(c.id)
          section?.scrollIntoView({ block: "start", behavior: "instant" })
          section?.focus({ preventScroll: true })
        })
      }}>
        <i style={{ background: c.color }} aria-hidden="true" /><small>{c.number}</small><span>{c.label}</span>
      </Link>)}
      <div className="transport-modes">
        <ModeLink destination="casebook" current={mode} onNavigate={() => setOpen(false)} />
        <ModeLink destination="brief" current={mode} onNavigate={() => setOpen(false)}>60 sec</ModeLink>
        <ModeLink destination="archive" current={mode} onNavigate={() => setOpen(false)}>Full record</ModeLink>
      </div>
    </div>
    <button className="motion-toggle" type="button" disabled={systemReduced} aria-label={systemReduced ? "Motion off (system preference)" : "Scroll motion"} aria-pressed={motion} onClick={toggleMotion}>Motion <strong>{motion ? "On" : "Off"}</strong></button>
  </nav>
}
