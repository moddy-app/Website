"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Floating, blurred header frame. It stays transparent-ish at the top of the
 * page and gains a stronger backdrop and shadow once the page scrolls.
 */
function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        data-scrolled={scrolled}
        className={cn(
          "mx-auto grid h-14 max-w-5xl grid-cols-[1fr_auto] items-center gap-2 rounded-2xl pr-2 pl-4 ring-1 ring-foreground/10 transition-[background-color,box-shadow] duration-300 md:grid-cols-[1fr_auto_1fr]",
          "bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60",
          "data-[scrolled=true]:shadow-lg data-[scrolled=true]:shadow-foreground/5 data-[scrolled=true]:supports-[backdrop-filter]:bg-background/70"
        )}
      >
        {children}
      </div>
    </header>
  )
}

export { HeaderShell }
