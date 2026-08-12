import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CodeSnippetProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

function CodeSnippet({ code, language, filename, className }: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const label = filename ?? language

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/50", className)}>
      {label && (
        <div className="flex items-center justify-between border-b bg-muted/80 px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {!filename && language && (
            <span className="rounded bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-7 text-muted-foreground hover:text-foreground"
          onClick={copy}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
        <pre className="overflow-x-auto p-4 pr-10 text-sm leading-relaxed">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  )
}

export { CodeSnippet }
