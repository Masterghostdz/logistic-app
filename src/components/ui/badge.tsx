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
