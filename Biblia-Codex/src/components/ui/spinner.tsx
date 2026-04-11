import * as React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
}

const sizeClasses = {
  sm: "size-4 border-2",
  default: "size-6 border-2",
  lg: "size-8 border-3",
  xl: "size-12 border-4",
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-[var(--border-bible)] border-t-[var(--accent-bible)]",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

const SpinnerWithText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { text?: string }
>(({ className, text = "Carregando...", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center justify-center gap-3", className)}
    {...props}
  >
    <Spinner size="lg" />
    {text && (
      <span className="text-sm text-[var(--text-bible-muted)] animate-pulse">
        {text}
      </span>
    )}
  </div>
))
SpinnerWithText.displayName = "SpinnerWithText"

export { Spinner, SpinnerWithText }