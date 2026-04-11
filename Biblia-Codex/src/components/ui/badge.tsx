import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]",
  secondary: "bg-[var(--surface-2)] text-[var(--text-bible-muted)]",
  outline: "border border-[var(--border-bible-strong)] text-[var(--text-bible)]",
  success: "bg-[var(--success-bible)] text-white",
  warning: "bg-[var(--warning-bible)] text-white",
  danger: "bg-[var(--danger-bible)] text-white",
} as const

export type BadgeVariant = keyof typeof badgeVariants

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
          badgeVariants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }