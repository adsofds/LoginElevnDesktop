'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Icon } from '../ui/icons'

/**
 * Shown before registering a non-renewal for a student who still has an active app
 * login: the non-renewal removes the login and the student loses access right away.
 */
export function RevokeAccessDialog({
  studentName,
  loginEmail,
  reason,
  onCancel,
  onConfirm,
}: {
  studentName: string
  loginEmail?: string
  reason: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const firstName = studentName.split(' ')[0]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  // Portaled to <body> and above the student file modal (.elevn-modal-backdrop, z 130),
  // so the popup is never hidden behind the ficha it was opened from.
  return createPortal(
    <div className="fixed inset-0 z-[200] grid place-items-center px-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-night/40 backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="revoke-title"
        aria-describedby="revoke-description"
        className="relative w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-modal animate-[menu-in_160ms_var(--ease-out-soft)]"
      >
        <span className="grid size-10 place-items-center rounded-full bg-danger-soft text-danger">
          <Icon name="key" className="size-5" />
        </span>
        <h2 id="revoke-title" className="mt-3 text-base font-semibold text-ink">
          {firstName} tem login ativo no app
        </h2>
        <div id="revoke-description" className="mt-1.5 space-y-2 text-sm text-ink-2">
          <p>
            Ao registrar a não renovação, o login
            {loginEmail && (
              <>
                {' '}
                <strong className="font-medium text-ink">{loginEmail}</strong>
              </>
            )}{' '}
            é removido e {firstName}{' '}
            <strong className="font-medium text-ink">perde o acesso</strong> ao app na hora:
            treinos, dieta, fotos e avisos.
          </p>
          <p className="text-ink-3">
            {firstName} passa para Inativos. Se voltar, use “Recuperar” e gere uma nova chave de
            acesso.
          </p>
        </div>
        {reason && (
          <p className="mt-3 rounded-lg bg-subtle px-3 py-2 text-xs text-ink-2">
            <span className="font-medium text-ink-3">Motivo:</span> {reason}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} autoFocus>
            Cancelar
          </Button>
          <Button size="sm" variant="danger" onClick={onConfirm}>
            Registrar e remover acesso
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
