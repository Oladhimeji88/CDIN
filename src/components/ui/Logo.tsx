import { cn } from '@/lib/cn'

interface LogoProps {
  size?: number
  withText?: boolean
  tone?: 'dark' | 'light'
  className?: string
}

/** CDIN brand mark. */
export function Logo({ size = 36, withText = true, tone = 'dark', className }: LogoProps) {
  const text = tone === 'light' ? 'text-white' : 'text-navy-950'
  const sub = tone === 'light' ? 'text-civic-200' : 'text-ink-500'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cdinLogo.svg"
        alt="CDIN"
        width={size}
        height={size}
        className="shrink-0 rounded-[24%]"
      />
      {withText && (
        <div className="leading-none">
          <div className={cn('font-display text-lg font-extrabold tracking-tight', text)}>
            CDIN
          </div>
          <div className={cn('text-[10px] font-medium uppercase tracking-[0.18em]', sub)}>
            Civic Integrity
          </div>
        </div>
      )}
    </div>
  )
}
