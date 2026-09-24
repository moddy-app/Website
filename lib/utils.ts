export { cn } from "cn"

/** Up to two uppercase initials, used as Avatar fallbacks. */
export function getInitials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
  return letters.toUpperCase() || "?"
}
