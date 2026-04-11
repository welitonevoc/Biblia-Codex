import * as React from "react"
import { cn } from "@/lib/utils"

const Separator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  orientation = "horizontal",
  ...props
}) => (
  <div
    className={cn(
      "shrink-0 bg-[var(--border-bible)]",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
)

export { Separator }