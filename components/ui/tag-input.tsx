import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface TagInputProps {
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value = [], onChange, placeholder = "Add tag...", maxTags, disabled, className }, ref) => {
    const [inputValue, setInputValue] = React.useState("")

    const addTag = (tag: string) => {
      const trimmed = tag.trim()
      if (!trimmed || value.includes(trimmed)) return
      if (maxTags !== undefined && value.length >= maxTags) return
      onChange?.([...value, trimmed])
    }

    const removeTag = (tag: string) => {
      onChange?.(value.filter((t) => t !== tag))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        addTag(inputValue)
        setInputValue("")
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1])
      }
    }

    return (
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue) {
              addTag(inputValue)
              setInputValue("")
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="min-w-20 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
    )
  }
)
TagInput.displayName = "TagInput"

export { TagInput }
