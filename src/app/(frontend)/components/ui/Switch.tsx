'use client'

import { cx } from './cx'

/** Accessible on/off switch (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 ease-out-soft',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-ink-3/35',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-soft motion-reduce:transition-none',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
