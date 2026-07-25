import * as React from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

