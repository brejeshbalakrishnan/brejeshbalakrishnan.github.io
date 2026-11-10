"use client"

import { useEffect } from "react"

export function StoryCues() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute("data-entered", "")
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.2 })
    document.querySelectorAll(".interval, .misses-chart, .loop li").forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])
  return null
}
