/**
 * Moddy Max prices, shown on the premium page. The real amounts are charged by
 * Stripe: update them here whenever the Stripe prices change.
 */
export const MODDY_MAX_PRICING = {
  currency: "EUR",
  monthly: 1.99,
  yearly: 9.99,
} as const

export const PLANS = ["monthly", "yearly"] as const

export type Plan = (typeof PLANS)[number]

export const DEFAULT_PLAN: Plan = "yearly"

export function isPlan(value: unknown): value is Plan {
  return PLANS.includes(value as Plan)
}

/** Share of the price saved by paying yearly instead of 12 monthly payments (0 to 1). */
export function getYearlySaving() {
  const { monthly, yearly } = MODDY_MAX_PRICING
  return Math.max(0, 1 - yearly / (monthly * 12))
}

/** What the yearly plan costs per month. */
export function getYearlyMonthlyEquivalent() {
  return MODDY_MAX_PRICING.yearly / 12
}
