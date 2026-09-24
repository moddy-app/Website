import { resolveLocale } from "@/i18n/server"

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  await resolveLocale(params)
  return <div className="min-h-[60svh]" />
}
