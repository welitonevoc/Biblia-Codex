import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-md hover:bg-[var(--accent-bible-strong)] hover:shadow-lg active:scale-[0.98] transition-all duration-200",
  destructive: "bg-[var(--danger-bible)] text-white shadow-sm hover:bg-[var(--danger-bible)]/90 hover:shadow-md",
  outline: "border border-[var(--border-bible-strong)] bg-transparent text-[var(--text-bible)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent-bible)]",
  secondary: "bg-[var(--surface-2)] text-[var(--text-bible)] hover:bg-[var(--surface-3)]",
  ghost: "text-[var(--text-bible)] hover:bg-[var(--surface-hover)]",
  link: "text-[var(--accent-bible)] underline-offset-4 hover:underline",
  glass: "bg-[var(--surface-1)] backdrop-blur-xl border border-[var(--border-bible)] text-[var(--text-bible)] hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
  premium: "bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] text-[var(--accent-bible-contrast)] shadow-lg shadow-[var(--accent-bible)]/20 hover:shadow-xl hover:shadow-[var(--accent-bible)]/30 hover:scale-[1.02] active:scale-[0.98]",
} as const

const buttonSizes = {
  default: "h-10 px-4 py-2 rounded-lg text-sm font-medium",
  sm: "h-8 rounded-md px-3 text-xs font-medium",
  lg: "h-12 rounded-lg px-8 text-base font-medium",
  xl: "h-14 rounded-xl px-10 text-lg font-medium",
  icon: "h-10 w-10 rounded-lg",
} as const

export type ButtonVariant = keyof typeof buttonVariants
export type ButtonSize = keyof typeof buttonSizes

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-bible)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, buttonSizes }