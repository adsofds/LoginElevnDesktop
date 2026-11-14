'use client'

import { useEffect, useState } from 'react'
import { Button } from './Button'

/** Small modal that asks for a name (saved layouts, saved views). Validates duplicates and length. */
export function NameDialog({
  title,
  description,
  label = 'Nome',
  confirmLabel,
  initialValue = '',
  takenNames = [],
  onCancel,
  onConfirm,
}: {
  title: string
  description?: string
  label?: string
  confirmLabel: string
  initialValue?: string
  takenNames?: string[]
  onCancel: () => void
  onConfirm: (name: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  const name = value.trim()
  const duplicate = takenNames.some((taken) => taken.toLowerCase() === name.toLowerCase())
  const error = !name ? '' : duplicate ? 'Já existe um item com esse nome.' : name.length > 32 ? 'Use até 32 caracteres.' : ''

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center px-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-night/40 backdrop-blur-[2px]"
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(event) => {
          event.preventDefault()
          if (name && !error) onConfirm(name)
        }}
        className="relative w-full max-w-sm rounded-card border border-line bg-surface p-5 shadow-modal animate-[menu-in_160ms_var(--ease-out-soft)]"
      >
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        <label className="mt-4 block text-xs font-medium text-ink-2" htmlFor="name-dialog-input">
          {label}
        </label>
        <input
          id="name-dialog-input"
          autoFocus
          value={value}
          maxLength={40}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'name-dialog-error' : undefined}
          className="mt-1.5 h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand"
        />
        {error && (
          <p id="name-dialog-error" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" variant="accent" type="submit" disabled={!name || !!error}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
