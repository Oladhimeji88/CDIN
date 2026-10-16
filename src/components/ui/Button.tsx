'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 focus-civic disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary:
    'bg-civic-600 text-white shadow-[0_6px_20px_-6px_rgba(10,135,84,0.6)] hover:bg-civic-700',
  secondary:
    'bg-white text-navy-900 border border-ink-200 hover:border-civic-300 hover:bg-civic-50',
  dark: 'bg-navy-950 text-white hover:bg-navy-900',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-navy-900',
  subtle: 'bg-civic-50 text-civic-700 hover:bg-civic-100',
  danger: 'bg-danger text-white hover:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, iconLeft, iconRight, className, children, disabled, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        iconLeft && <span className="shrink-0">{iconLeft}</span>
      )}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  )
})
