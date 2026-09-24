import { siteConfig } from "@/lib/site-config"

/**
 * Official Better Stack status badge (status.moddy.app). Both variants are
 * declared and CSS shows the one matching the site theme; `loading="lazy"`
 * means the hidden one is never fetched. The iframe's color-scheme must match
 * its variant, otherwise the browser paints an opaque background behind it.
 */
function StatusBadge({ title }: { title: string }) {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        <iframe
          key={theme}
          src={`${siteConfig.links.status}/badge?theme=${theme}`}
          title={title}
          width={250}
          height={30}
          loading="lazy"
          scrolling="no"
          style={{ colorScheme: theme }}
          className={theme === "light" ? "dark:hidden" : "hidden dark:block"}
        />
      ))}
    </>
  )
}

export { StatusBadge }
