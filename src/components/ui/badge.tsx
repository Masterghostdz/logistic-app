import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border text-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "px-3 py-0.5 text-xs font-semibold min-w-[44px] border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "px-3 py-0.5 text-xs font-semibold min-w-[44px] border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "px-3 py-0.5 text-xs font-semibold min-w-[44px] border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "px-3 py-0.5 text-xs font-semibold min-w-[44px] text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] min-w-[36px]",
        md: "px-3 py-0.5 text-xs min-w-[44px]",
        lg: "px-4 py-1 text-sm min-w-[56px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

// Shared helper to produce a consistent 'online' badge appearance across dashboards.
// Consumers can import `onlineBadgeClass` and apply alongside `badgeStyle` from useTableZoom.
export const onlineBadgeClass = `bg-green-100 text-green-700 border border-green-300 shadow font-semibold`;

/** Offline badge style for 'Hors Ligne' state */
export const offlineBadgeClass = `bg-red-100 text-red-700 border border-red-300 shadow font-semibold`;

export const onlineBadgeInline = {
  fontSize: '12px',
  padding: '4px 8px',
  minWidth: 0,
  lineHeight: '14px',
  borderRadius: '9999px'
} as React.CSSProperties;

export const offlineBadgeInline = {
  fontSize: '12px',
  padding: '4px 8px',
  minWidth: 0,
  lineHeight: '14px',
  borderRadius: '9999px'
} as React.CSSProperties;
