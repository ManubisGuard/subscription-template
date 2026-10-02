import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
export function CyberCard({ children, className, accent = 'primary', id }: { children: ReactNode; className?: string; accent?: 'primary'|'cyan'|'green'|'amber'|'danger'; id?: string }) {
  return <section id={id} className={cn('cyber-card', 'cyber-card-'+accent, className)}>{children}</section>
}
export function SectionHeading({ eyebrow, title, meta, action }: { eyebrow?: string; title: string; meta?: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3 mb-5"><div className="min-w-0">{eyebrow && <div className="cyber-eyebrow">{eyebrow}</div>}<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>{meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}</div>{action}</div>
}
