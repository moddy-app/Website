import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.discordapp.com" }],
  },
  async redirects() {
    return [
      // Short links kept from the previous site. Query strings (e.g. UTM
      // parameters on /install) are forwarded to the destination.
      {
        source: "/install",
        destination: "https://api.moddy.app/install",
        permanent: false,
      },
      {
        source: "/support",
        destination: "https://discord.gg/Z6F5Jg4WwF",
        permanent: false,
      },
      {
        source: "/status",
        destination: "https://status.moddy.app",
        permanent: false,
      },
      {
        source: "/terms",
        destination: "https://docs.moddy.app/legal/tos",
        permanent: false,
      },
      {
        source: "/privacy",
        destination: "https://docs.moddy.app/legal/privacy",
        permanent: false,
      },
      {
        source: "/license",
        destination: "https://docs.moddy.app/legal/license",
        permanent: false,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
