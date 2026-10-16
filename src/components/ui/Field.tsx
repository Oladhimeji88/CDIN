import { forwardRef } from 'react'
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

const fieldBase =
  'w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-navy-900 placeholder:text-ink-400 transition-colors focus:border-civic-400 focus-civic disabled:bg-ink-50'

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center justify-between text-sm font-semibold text-navy-800">
      <span>{children}</span>
      {hint && <span className="text-xs font-normal text-ink-400">{hint}</span>}
    </label>
  )
}

export function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { iconLeft?: ReactNode }>(
  function Input({ className, iconLeft, ...props }, ref) {
    if (iconLeft) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {iconLeft}
          </span>
          <input ref={ref} className={cn(fieldBase, 'h-11 pl-10', className)} {...props} />
        </div>
      )
    }
    return <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...props} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(fieldBase, 'h-11 appearance-none bg-[length:16px] pr-10', className)} {...props}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
      >
        {children}
      </select>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, 'min-h-24 py-3', className)} {...props} />
  },
)
