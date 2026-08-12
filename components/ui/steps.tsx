import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type StepStatus = "pending" | "active" | "completed"

export interface Step {
  title: string
  description?: string
}

export interface StepsProps {
  steps: Step[]
  current: number
  orientation?: "horizontal" | "vertical"
  className?: string
}

function StepIndicator({ index, status }: { index: number; status: StepStatus }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
        status === "completed" && "border-primary bg-primary text-primary-foreground",
        status === "active" && "border-primary bg-background text-primary",
        status === "pending" && "border-border bg-background text-muted-foreground"
      )}
    >
      {status === "completed" ? <Check className="h-4 w-4" /> : index + 1}
    </div>
  )
}

function StepLabel({ step, status }: { step: Step; status: StepStatus }) {
  return (
    <div>
      <p
        className={cn(
          "text-sm font-medium",
          status === "pending" ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {step.title}
      </p>
      {step.description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
      )}
    </div>
  )
}

function Steps({ steps, current, orientation = "horizontal", className }: StepsProps) {
  const getStatus = (i: number): StepStatus => {
    if (i < current) return "completed"
    if (i === current) return "active"
    return "pending"
  }

  if (orientation === "vertical") {
    return (
      <ol aria-label="Progress" className={cn("flex flex-col", className)}>
        {steps.map((step, i) => {
          const status = getStatus(i)
          const isLast = i === steps.length - 1
          return (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StepIndicator index={i} status={status} />
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 w-px flex-1",
                      status === "completed" ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              <div className={cn("pt-0.5 pb-6", isLast && "pb-0")}>
                <StepLabel step={step} status={status} />
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol aria-label="Progress" className={cn("flex items-start", className)}>
      {steps.map((step, i) => {
        const status = getStatus(i)
        const isLast = i === steps.length - 1
        return (
          <li key={i} className={cn("flex items-start", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-2 text-center">
              <StepIndicator index={i} status={status} />
              <StepLabel step={step} status={status} />
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mt-4 h-px flex-1",
                  status === "completed" ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Steps }
