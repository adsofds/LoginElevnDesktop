import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cx } from './cx'

/**
 * Table primitives with the Elevn table rules: sticky header, 44px rows,
 * hover in bg-subtle, numbers in tabular-nums. Adopted module by module from Fase 3.
 */
export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx('overflow-auto rounded-card border border-line bg-surface', className)}>
      <table className="w-full border-collapse text-left text-sm text-ink">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="sticky top-0 z-10 bg-subtle">{children}</thead>
}

export function TH({ className, children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cx(
        'h-10 border-b border-line px-4 text-xs font-semibold whitespace-nowrap text-ink-3',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

export function TR({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cx('border-b border-line-subtle last:border-0 hover:bg-subtle', className)}
      {...rest}
    >
      {children}
    </tr>
  )
}

export function TD({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cx('h-11 px-4 align-middle tabular-nums', className)} {...rest}>
      {children}
    </td>
  )
}
