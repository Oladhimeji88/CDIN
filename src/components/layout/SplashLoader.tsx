'use client'

import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'

export function SplashLoader({ label = 'Securing session…' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-navy-950">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Logo tone="light" size={48} />
      </motion.div>
      <div className="flex items-center gap-2 text-sm font-medium text-navy-300">
        <span className="h-2 w-2 animate-bounce rounded-full bg-civic-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-civic-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-civic-400" />
        <span className="ml-2">{label}</span>
      </div>
    </div>
  )
}
