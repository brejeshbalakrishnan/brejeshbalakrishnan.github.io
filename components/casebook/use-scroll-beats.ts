"use client"

import { useEffect, useState } from "react"

export function useScrollBeats(id: string, thresholds: readonly number[], flatBeat: number) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    const scene = document.getElementById(id)
    if (!scene) return
    const canPin = matchMedia("(min-width: 901px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)")
    let frame = 0
    let active = false
    const read = () => {
      frame = 0
      if (!canPin.matches || document.documentElement.dataset.motion === "off") { setBeat(flatBeat); return }
      const rect = scene.getBoundingClientRect()
      const progress = -rect.top / Math.max(1, rect.height - innerHeight)
      setBeat(thresholds.filter(x => progress >= x).length)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(read) }
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting
      schedule()
    }, { rootMargin: "150px 0px" })
    observer.observe(scene)
    const onScroll = () => { if (active) schedule() }
    const motionObserver = new MutationObserver(schedule)
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] })
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("resize", schedule)
    canPin.addEventListener("change", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      motionObserver.disconnect()
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", schedule)
      canPin.removeEventListener("change", schedule)
    }
  }, [id, thresholds, flatBeat])
  return beat
}
