"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState, useTransition } from "react"

const modes = {
  casebook: { label: "Casebook", href: "/", status: "Opening Casebook" },
  brief: { label: "60 seconds", href: "/60-seconds/", status: "Opening 60-second overview" },
  archive: { label: "Archive", href: "/archive/", status: "Opening full record" },
} as const

export type Mode = keyof typeof modes
const modeOrder: Mode[] = ["casebook", "brief", "archive"]
const pendingDelay = 135

type NavigationIntent = { mode: Mode; started: number }
function rememberReaderPosition() {
  const reader = document.getElementById("main-content")
  if (!reader || getComputedStyle(reader).overflowY !== "auto") return
  const state = window.history.state
  if (state && state.casebookReaderTop !== reader.scrollTop) {
    window.history.replaceState({ ...state, casebookReaderTop: reader.scrollTop }, "")
  }
}

const RouteFeedback = createContext<{
  pending: Mode | null
  open: (mode: Mode) => boolean
} | null>(null)

export function RouteFeedbackProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [navigating, startNavigation] = useTransition()
  const [intent, setIntent] = useState<NavigationIntent | null>(null)
  const [visibleIntent, setVisibleIntent] = useState<NavigationIntent | null>(null)
  const currentPath = pathname?.replace(/\/$/, "") ?? ""
  const activeIntent = navigating && intent && modes[intent.mode].href.replace(/\/$/, "") !== currentPath ? intent : null

  useEffect(() => {
    let observer: MutationObserver | undefined
    let frame = 0
    const cancelRestore = () => {
      observer?.disconnect()
      cancelAnimationFrame(frame)
    }
    const onScrollEnd = (event: Event) => {
      if (event.target === document.getElementById("main-content")) rememberReaderPosition()
    }
    const onHistory = (event: PopStateEvent) => {
      setIntent(null)
      cancelRestore()
      const top: unknown = event.state?.casebookReaderTop
      if (typeof top !== "number" || window.location.hash) return
      const destination = window.location.pathname
      const restore = () => {
        const active = document.querySelector<HTMLAnchorElement>('.mode-links a[aria-current="page"]')
        if (active?.pathname !== destination) return
        observer?.disconnect()
        frame = requestAnimationFrame(() => {
          const reader = document.getElementById("main-content")
          if (reader && getComputedStyle(reader).overflowY === "auto") reader.scrollTo({ top, behavior: "instant" })
        })
      }
      observer = new MutationObserver(restore)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-current"] })
      restore()
    }
    window.addEventListener("popstate", onHistory, true)
    document.addEventListener("scrollend", onScrollEnd, true)
    return () => {
      cancelRestore()
      window.removeEventListener("popstate", onHistory, true)
      document.removeEventListener("scrollend", onScrollEnd, true)
    }
  }, [])

  useEffect(() => {
    if (!activeIntent) return
    const remaining = Math.max(0, pendingDelay - (performance.now() - activeIntent.started))
    const timer = window.setTimeout(() => setVisibleIntent(activeIntent), remaining)
    return () => window.clearTimeout(timer)
  }, [activeIntent])

  const pending = activeIntent && activeIntent === visibleIntent ? activeIntent.mode : null
  function open(mode: Mode) {
    const { href } = modes[mode]
    if (href.replace(/\/$/, "") === currentPath) return false
    rememberReaderPosition()
    setIntent({ mode, started: performance.now() })
    startNavigation(() => router.push(href))
    return true
  }

  return <RouteFeedback.Provider value={{ pending, open }}>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{pending ? modes[pending].status : ""}</span>
    {children}
  </RouteFeedback.Provider>
}

export function ModeLink({ destination, current, className, children, onNavigate }: {
  destination: Mode
  current?: Mode
  className?: string
  children?: React.ReactNode
  onNavigate?: () => void
}) {
  const feedback = useContext(RouteFeedback)
  const pending = feedback?.pending === destination
  const mode = modes[destination]
  return <Link href={mode.href} className={className} prefetch={false}
    aria-current={current === destination ? "page" : undefined}
    data-route-pending={pending || undefined}
    onNavigate={event => {
      onNavigate?.()
      if (feedback?.open(destination)) event.preventDefault()
    }}>
    {children ?? mode.label}
  </Link>
}

export function ModeLinks({ mode }: { mode: Mode }) {
  const feedback = useContext(RouteFeedback)
  return <nav className="mode-links" aria-label="Reading modes" data-route-pending={Boolean(feedback?.pending) || undefined}>
    {modeOrder.map(destination => <ModeLink key={destination} destination={destination} current={mode} />)}
  </nav>
}
