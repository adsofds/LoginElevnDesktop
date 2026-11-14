'use client'

import { cx } from './cx'

export const passwordChecks = (value: string) => [
  { label: 'Mínimo de 8 caracteres', met: value.length >= 8 },
  { label: 'Uma letra maiúscula', met: /[A-Z]/.test(value) },
  { label: 'Uma letra minúscula', met: /[a-z]/.test(value) },
  { label: 'Um número', met: /[0-9]/.test(value) },
  { label: 'Um caractere especial (!@#$%&*)', met: /[^A-Za-z0-9]/.test(value) },
]

const levels = [
  { label: 'Muito fraca', color: 'bg-danger', text: 'text-danger' },
  { label: 'Fraca', color: 'bg-danger', text: 'text-danger' },
  { label: 'Razoável', color: 'bg-warning', text: 'text-warning' },
  { label: 'Boa', color: 'bg-warning', text: 'text-warning' },
  { label: 'Forte', color: 'bg-success', text: 'text-success' },
]

/**
 * Five segments that light up as the password meets each rule, with the
 * checklist collapsed underneath. Shared by Login (first access) and Configurações.
 */
export function PasswordStrength({
  value,
  tone = 'light',
  className,
  checks: customChecks,
}: {
  value: string
  tone?: 'light' | 'dark'
  className?: string
  /** Custom rules (e.g. first access asks for 12 characters). Defaults to passwordChecks. */
  checks?: { label: string; met: boolean; detail?: string }[]
}) {
  const checks = customChecks ?? passwordChecks(value)
  const met = checks.filter((check) => check.met).length
  const level =
    levels[
      Math.min(
        levels.length - 1,
        Math.max(0, Math.round((met / checks.length) * levels.length) - 1),
      )
    ]
  return (
    <div className={className}>
      <div className="flex gap-1" aria-hidden="true">
        {checks.map((_, index) => (
          <span
            key={index}
            className={cx(
              'h-1.5 flex-1 rounded-full transition-colors duration-200',
              index < met ? level.color : tone === 'dark' ? 'bg-white/12' : 'bg-line',
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs" aria-live="polite">
        <span
          className={cx(
            'font-medium',
            value ? level.text : tone === 'dark' ? 'text-white/50' : 'text-ink-3',
          )}
        >
          {value ? `Senha ${level.label.toLowerCase()}` : 'Digite a nova senha'}
        </span>
        <span className={tone === 'dark' ? 'text-white/50' : 'text-ink-3'}>
          {met} de {checks.length} requisitos
        </span>
      </div>
      <details className="group mt-1">
        <summary
          className={cx(
            'cursor-pointer list-none text-xs [&::-webkit-details-marker]:hidden',
            tone === 'dark' ? 'text-white/60 hover:text-white' : 'text-ink-2 hover:text-ink',
          )}
        >
          <span className="group-open:hidden">Ver requisitos</span>
          <span className="hidden group-open:inline">Ocultar requisitos</span>
        </summary>
        <ul className="mt-1.5 space-y-1 text-xs">
          {checks.map((check) => (
            <li
              key={check.label}
              className={cx(
                'flex items-center gap-1.5',
                check.met ? 'text-success' : tone === 'dark' ? 'text-white/60' : 'text-ink-3',
              )}
            >
              <span aria-hidden="true">{check.met ? '✓' : '○'}</span>
              {check.label}
              <span className="sr-only">{check.met ? ' (atendido)' : ' (pendente)'}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
