import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'icon'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold ' +
  'transition-[background-color,color,border-color,box-shadow] duration-150 ease-out-soft ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
  'disabled:pointer-events-none disabled:opacity-45 cursor-pointer'

const variants: Record<ButtonVariant, string> = {
  // ink button: the default call to action on light surfaces
  primary: 'bg-night text-white hover:bg-ink-2',
  // one per screen, for the key action
  accent: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-surface text-ink hover:border-ink-3 hover:bg-subtle',
  ghost: 'text-ink-2 hover:bg-subtle hover:text-ink',
  danger: 'border border-danger/25 bg-danger-soft text-danger hover:border-danger/50',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'size-9 text-sm',
}

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type LinkProps = CommonProps & { href: string; onClick?: () => void; 'aria-label'?: string }

export function buttonClasses(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md') {
  return cx(base, variants[variant], sizes[size])
}

/** Shared button. Pass `href` to render a Next.js link with the same look. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'secondary', size = 'md', className, children } = props
  const classes = cx(buttonClasses(variant, size), className)

  if (props.href !== undefined) {
    return (
      <Link
        href={props.href}
        className={classes}
        onClick={props.onClick}
        aria-label={props['aria-label']}
      >
        {children}
      </Link>
    )
  }

  const { variant: _v, size: _s, className: _c, children: _ch, type = 'button', ...rest } = props
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
