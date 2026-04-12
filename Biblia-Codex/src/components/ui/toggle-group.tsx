import * as React from "react"
import { cn } from "../../lib/utils"

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  type?: "single" | "multiple"
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onValueChange,
  type = "single",
  className,
  children,
  ...props
}) => {
  const handleChildClick = (childValue: string) => {
    if (type === "single") {
      onValueChange?.(childValue)
    } else {
      const currentValues = value?.split(",") || []
      const newValues = currentValues.includes(childValue)
        ? currentValues.filter((v) => v !== childValue)
        : [...currentValues, childValue]
      onValueChange?.(newValues.join(","))
    }
  }

  return (
    <div className={cn("inline-flex rounded-lg bg-[var(--surface-1)] p-1", className)} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ value: string; selected?: boolean; onClick?: () => void }>, {
              selected: type === "single" 
                ? (child.props as any).value === value
                : value?.split(",").includes((child.props as any).value),
              onClick: () => handleChildClick((child.props as any).value),
            })
          : child
      )}
    </div>
  )
}

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  selected?: boolean
}

const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  className,
  selected,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium",
        "transition-all duration-200",
        selected
          ? "bg-[var(--surface-0)] text-[var(--text-bible)] shadow-sm"
          : "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }