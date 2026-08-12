import * as React from "react"
import { File, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface FileUploaderProps {
  value?: File[]
  onChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  disabled?: boolean
  className?: string
}

function FileUploader({
  value = [],
  onChange,
  accept,
  multiple = true,
  maxSize,
  disabled,
  className,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const newFiles = Array.from(incoming).filter(
      (f) => !maxSize || f.size <= maxSize
    )
    onChange?.(multiple ? [...value, ...newFiles] : [newFiles[0]])
  }

  const removeFile = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background px-6 py-8 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          !disabled && "cursor-pointer hover:border-primary hover:bg-primary/5",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click()
        }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (!disabled) addFiles(e.dataTransfer.files)
        }}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or{" "}
          <span className="text-primary underline-offset-2 hover:underline">browse</span>
        </p>
        {maxSize && (
          <p className="mt-1 text-xs text-muted-foreground">Max size: {formatSize(maxSize)}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatSize(file.size)}
              </span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileUploader }
