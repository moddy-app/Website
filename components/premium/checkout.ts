import { getLoginUrl } from "@/lib/auth"
import { siteConfig } from "@/lib/site-config"

import type { Plan } from "./pricing"

/**
 * Browser-side Stripe checkout for Moddy Max.
 *
 * `POST /stripe/create-checkout` needs the visitor's session cookie, which only
 * exists on moddy.app: on localhost or a preview the request fails, and the
 * page shows its generic error.
 */

const TIMEOUT_MS = 15_000

export type CheckoutResult =
  | { type: "redirect"; url: string }
  | { type: "login"; url: string }
  | { type: "blocked" }
  | { type: "error" }

export async function createCheckout(
  plan: Plan,
  returnUrl: string
): Promise<CheckoutResult> {
  try {
    const response = await fetch(
      `${siteConfig.apiUrl}/stripe/create-checkout`,
      {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, return_url: returnUrl }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    )

    if (response.status === 401) {
      return { type: "login", url: getLoginUrl(getSignInReturnUrl(plan)) }
    }

    const data: unknown = await response.json().catch(() => null)
    if (response.status === 403 && isBlockedUserError(data)) {
      return { type: "blocked" }
    }
    const url = response.ok ? getCheckoutUrl(data) : null
    return url ? { type: "redirect", url } : { type: "error" }
  } catch {
    return { type: "error" }
  }
}

/** This page with the chosen plan, so it is preselected after signing in. */
function getSignInReturnUrl(plan: Plan) {
  const url = new URL(window.location.href)
  url.searchParams.delete("premium")
  url.searchParams.set("plan", plan)
  url.hash = ""
  return url.toString()
}

function getCheckoutUrl(data: unknown) {
  const url = isRecord(data) ? data.url : null
  return typeof url === "string" && url.startsWith("https://") ? url : null
}

/** `403 { "error": { "code": "premium_blocked_user", … } }` */
function isBlockedUserError(data: unknown) {
  const error = isRecord(data) ? data.error : null
  return isRecord(error) && error.code === "premium_blocked_user"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
