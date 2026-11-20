import Link from 'next/link'
import { Icon } from '../ui/icons'

/** Placeholder for a module that is on the roadmap but not part of the current release. */
export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-pop">
        <Icon name={icon} className="size-6" />
      </span>
      <span className="mt-6 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-ink-3">
        Em breve
      </span>
      <h1 className="mt-3 text-[28px] leading-9 font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-ink-2">{description}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-control bg-night px-4 text-sm font-medium text-on-dark transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name="arrowLeft" className="size-4" /> Voltar ao Dashboard
      </Link>
    </section>
  )
}
