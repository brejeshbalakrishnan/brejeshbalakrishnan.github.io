"use client"

import { useEffect, useState } from "react"

export function motionEnabled() {
  return document.documentElement.dataset.motion !== "off" && !matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useScrollBeats(id: string, thresholds: readonly number[]) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    const scene = document.getElementById(id)
    if (!scene) return
    const pin = scene.querySelector(".pin")
    if (!pin) return
    let frame = 0
    let active = false
    let pinned = false
    const read = () => {
      frame = 0
      if (!pinned) { setBeat(0); return }
      const rect = scene.getBoundingClientRect()
      const progress = -rect.top / Math.max(1, rect.height - innerHeight)
      setBeat(thresholds.filter(x => progress >= x).length)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(read) }
    const syncLayout = () => { pinned = getComputedStyle(pin).position === "sticky"; schedule() }
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting
      schedule()
    }, { rootMargin: "150px 0px" })
    observer.observe(scene)
    const onScroll = () => { if (active) schedule() }
    const motionObserver = new MutationObserver(syncLayout)
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] })
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("resize", syncLayout)
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    preference.addEventListener("change", syncLayout)
    syncLayout()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      motionObserver.disconnect()
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", syncLayout)
      preference.removeEventListener("change", syncLayout)
    }
  }, [id, thresholds])
  return beat
}
