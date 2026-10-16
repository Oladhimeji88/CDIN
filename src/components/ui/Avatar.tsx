import { initials } from '@/lib/format'
import { cn } from '@/lib/cn'

const palette = [
  'bg-civic-100 text-civic-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-navy-100 text-navy-700',
  'bg-violet-100 text-violet-700',
]

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const idx = name.charCodeAt(0) % palette.length
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold', palette[idx], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  )
}
