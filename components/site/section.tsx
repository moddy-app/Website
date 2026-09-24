import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Page layout primitives shared by every page, so spacing, widths and
 * heading styles stay identical everywhere:
 *
 *   <Section tone="surface">
 *     <SectionHeader title="…" description="…" />
 *     …content…
 *   </Section>
 */

const sectionVariants = cva("px-4 sm:px-6", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      surface: "bg-surface text-surface-foreground",
    },
    spacing: {
      default: "py-20 sm:py-28",
      compact: "py-12 sm:py-16",
      none: "",
    },
  },
  defaultVariants: {
    tone: "default",
    spacing: "default",
  },
})

function Section({
  className,
  tone,
  spacing,
  children,
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ tone, spacing }), className)}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 sm:gap-16">
        {children}
      </div>
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  align?: "center" | "start"
  as?: "h1" | "h2"
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow && <p className="text-sm font-medium text-brand">{eyebrow}</p>}
      <Heading
        className={cn(
          "font-heading font-semibold tracking-tight text-balance",
          Heading === "h1"
            ? "text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
            : "text-4xl leading-[1.1] sm:text-5xl"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className="text-lg text-pretty text-muted-foreground sm:text-xl">
          {description}
        </p>
      )}
    </header>
  )
}

export { Section, SectionHeader, sectionVariants }
