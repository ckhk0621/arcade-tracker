import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        arcade: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        restaurant: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
        entertainment: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        bowling: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        family: "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200",
        bar: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        mall: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }