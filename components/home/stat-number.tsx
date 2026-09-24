"use client"

import * as React from "react"
import { useLocale } from "next-intl"

const DURATION_MS = 1200

/**
 * A number that counts up when it scrolls into view. The final value is
 * rendered on the server (SEO, no-JS, screen readers); the animation only
 * rewrites the text in place, and is skipped with reduced motion or when the
 * number is already visible on load.
 */
function StatNumber({
  value,
  options,
}: {
  value: number
  options?: Intl.NumberFormatOptions
}) {
  const locale = useLocale()
  const ref = React.useRef<HTMLSpanElement>(null)
  const format = React.useMemo(
    () => new Intl.NumberFormat(locale, options),
    [locale, options]
  )

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (
      reduceMotion ||
      element.getBoundingClientRect().top < window.innerHeight
    ) {
      return
    }

    let frame = 0
    element.textContent = format.format(0)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          element.textContent = format.format(value * eased)
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      element.textContent = format.format(value)
    }
  }, [format, value])

  return (
    <span ref={ref} className="tabular-nums">
      {format.format(value)}
    </span>
  )
}

export { StatNumber }
