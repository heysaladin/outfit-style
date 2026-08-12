import * as React from "react"
import { Star } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ratingStarVariants = cva("transition-transform", {
  variants: {
    size: {
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface RatingProps extends VariantProps<typeof ratingStarVariants> {
  value?: number
  onChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  disabled?: boolean
  className?: string
}

function Rating({
  value = 0,
  onChange,
  max = 5,
  size,
  readOnly,
  disabled,
  className,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)

  const interactive = !readOnly && !disabled
  const displayValue = hovered !== null ? hovered : value

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          aria-label={interactive ? `Rate ${star} out of ${max}` : undefined}
          aria-pressed={interactive ? star === value : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
          className={cn(
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm",
            interactive && "cursor-pointer hover:scale-110",
            !interactive && "cursor-default",
            disabled && "opacity-50"
          )}
        >
          <Star
            className={cn(
              ratingStarVariants({ size }),
              star <= displayValue
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export { Rating }
