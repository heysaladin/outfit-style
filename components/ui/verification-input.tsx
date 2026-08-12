import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { cn } from "@/lib/utils"

export interface VerificationInputProps {
  value?: string
  onChange?: (value: string) => void
  length?: 4 | 6
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

function VerificationSlots({ length }: { length: number }) {
  const { slots } = React.useContext(OTPInputContext)
  return (
    <div className="flex gap-2">
      {slots.slice(0, length).map(({ char, hasFakeCaret, isActive }, idx) => (
        <div
          key={idx}
          className={cn(
            "relative flex h-12 w-12 select-none items-center justify-center rounded-md border-2 border-input bg-background text-lg font-semibold transition-all",
            isActive && "border-ring ring-2 ring-ring/20"
          )}
        >
          {char !== null ? (
            char
          ) : (
            <span className="text-muted-foreground/30">·</span>
          )}
          {hasFakeCaret && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-px animate-caret-blink bg-foreground duration-1000" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const VerificationInput = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  VerificationInputProps
>(({ value, onChange, length = 6, disabled, autoFocus, className }, ref) => {
  return (
    <OTPInput
      ref={ref}
      maxLength={length}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus={autoFocus}
      containerClassName={cn(
        "flex items-center has-[:disabled]:opacity-50",
        className
      )}
      className="disabled:cursor-not-allowed"
    >
      <VerificationSlots length={length} />
    </OTPInput>
  )
})
VerificationInput.displayName = "VerificationInput"

export { VerificationInput }
