import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border border-[var(--border-bible-strong)] bg-[var(--surface-0)] px-4 py-2 text-sm text-[var(--text-bible)] ring-offset-[var(--bg-bible)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-bible-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-[var(--danger-bible)] focus:ring-[var(--danger-bible)]",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[var(--danger-bible)]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }