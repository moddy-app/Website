"use client"

import * as React from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}

/**
 * Reads one query parameter of the current URL. It is `null` while the page
 * is prerendered and hydrated, so the static HTML is the same for everyone
 * and the page does not need a Suspense boundary (unlike `useSearchParams`).
 */
export function useSearchParam(name: string) {
  return React.useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null
  )
}
