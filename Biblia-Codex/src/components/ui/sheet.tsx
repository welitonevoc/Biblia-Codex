import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetOverlayProps {
  onClick?: () => void
  className?: string
}

const SheetOverlay: React.FC<SheetOverlayProps> = ({ onClick, className }) => (
  <div
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    onClick={onClick}
    data-state={onClick ? "open" : "closed"}
  />
)

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom"
  children: React.ReactNode
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = "right", children, ...props }, ref) => {
    const sideClasses = {
      left: "left-0 top-0 h-full w-80 border-r border-[var(--border-bible)]",
      right: "right-0 top-0 h-full w-80 border-l border-[var(--border-bible)]",
      top: "top-0 left-0 right-0 h-auto max-h-[50vh]",
      bottom: "bottom-0 left-0 right-0 h-auto max-h-[50vh]",
    }

    const animateClasses = {
      left: "data-[state=open]:animate-slide-in-from-left data-[state=closed]:animate-slide-out-to-left",
      right: "data-[state=open]:animate-slide-in-from-right data-[state=closed]:animate-slide-out-to-right",
      top: "data-[state=open]:animate-slide-in-from-top data-[state=closed]:animate-slide-out-to-top",
      bottom: "data-[state=open]:animate-slide-in-from-bottom data-[state=closed]:animate-slide-out-to-bottom",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 bg-[var(--bg-bible)] p-6 shadow-xl",
          "transition-all duration-300 ease-premium",
          sideClasses[side],
          animateClasses[side],
          className
        )}
        data-state={children ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex items-center justify-between mb-6", className)}
    {...props}
  />
)

const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn(
      "text-lg font-semibold text-[var(--text-bible)]",
      className
    )}
    {...props}
  />
)

const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-sm text-[var(--text-bible-muted)]", className)}
    {...props}
  />
)

const SheetClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => (
  <button
    className={cn(
      "absolute right-4 top-4 rounded-full p-2",
      "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]",
      "hover:bg-[var(--surface-hover)] transition-all duration-200",
      "focus-ring",
      className
    )}
    {...props}
  >
    <X className="size-5" />
  </button>
)

const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  return (
    <>
      {open && <SheetOverlay onClick={() => onOpenChange(false)} />}
      {children}
    </>
  )
}

export {
  Sheet,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
}