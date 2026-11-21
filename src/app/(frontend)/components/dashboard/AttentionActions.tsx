'use client'

import { useEffect, useId, useState } from 'react'
import { fillPlaceholders, type NotificationTemplateId } from '@/lib/student-notifications'
import { Button } from '../ui/Button'

/*
 * The two ways the team acts on a pending item: a one-way notification in the student's
 * app, or a conversation on WhatsApp. There is no inbox in the panel.
 */

export type AttentionNotify = {
  templateId: NotificationTemplateId
  title: string
  /** May use {nome}, {data} and {vencimento}. */
  message: string
}

/** wa.me link with the message ready to send. */
export function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.93-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.41-.07.65.49.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.12.58.17.29.75 1.24 1.61 2 .89.79 1.61 1.07 1.92 1.2.24.1.38.08.53-.05.15-.14.62-.72.79-.96.17-.24.34-.19.58-.11.24.08 1.51.71 1.77.84.26.13.43.19.5.3.07.11.07.63-.17 1.31z"
      />
    </svg>
  )
}

/** Confirms (and lets the coach edit) the notification before it goes to the app. */
export function NotifyDialog({
  student,
  notify,
  expiration,
  onCancel,
  onSend,
}: {
  student: string
  notify: AttentionNotify
  expiration?: string
  onCancel: () => void
  onSend: (value: { title: string; message: string }) => void
}) {
  const id = useId()
  const [title, setTitle] = useState(notify.title)
  const [message, setMessage] = useState(() =>
    fillPlaceholders(notify.message, { name: student, date: new Date(), expiration }),
  )
  const [error, setError] = useState('')

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
        aria-labelledby={`${id}-title`}
        onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim() || !message.trim()) return setError('Preencha o título e a mensagem.')
          onSend({ title: title.trim(), message: message.trim() })
        }}
        className="relative w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-modal animate-[menu-in_160ms_var(--ease-out-soft)]"
      >
        <h2 id={`${id}-title`} className="text-base font-semibold text-ink">
          Notificar {student.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          Chega em “Avisos” no app do aluno. Para conversar, use o WhatsApp.
        </p>
        <label className="mt-4 block text-xs font-medium text-ink-2" htmlFor={`${id}-t`}>
          Título
        </label>
        <input
          id={`${id}-t`}
          value={title}
          maxLength={60}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          autoFocus
        />
        <label className="mt-3 block text-xs font-medium text-ink-2" htmlFor={`${id}-m`}>
          Mensagem
        </label>
        <textarea
          id={`${id}-m`}
          value={message}
          rows={4}
          maxLength={240}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-1.5 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-5 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <p className="mt-1 text-right text-[11px] text-ink-3 tabular-nums">{message.length}/240</p>
        {error && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Enviar notificação
          </Button>
        </div>
      </form>
    </div>
  )
}
