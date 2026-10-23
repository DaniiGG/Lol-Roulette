import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-8 flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 ${className}`.trim()}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-zinc-300">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-zinc-400' : undefined}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
