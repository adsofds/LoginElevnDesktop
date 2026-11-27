'use client'

import { notificationSenders, type NotificationSenderId } from '@/lib/demo-team'
import { SenderAvatar } from '../team/SenderAvatar'
import type { NotificationTemplateId } from '@/lib/student-notifications'
import { cx } from '../ui/cx'

/** Suggested sender for each template (the student sees this face next to the notice). */
export const defaultSender: Record<NotificationTemplateId, NotificationSenderId> = {
  treino: 'breno',
  dieta: 'athison',
  checkin: 'yasmin',
  plano: 'yasmin',
  livre: 'elevn',
}

/** Icon of the notification: the Elevn logo or one of the three team faces. */
export function SenderPicker({
  value,
  onChange,
}: {
  value: NotificationSenderId
  onChange: (id: NotificationSenderId) => void
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Ícone da notificação">
      {notificationSenders.map((member) => (
        <button
          key={member.id}
          type="button"
          role="radio"
          aria-checked={value === member.id}
          onClick={() => onChange(member.id)}
          className={cx(
            'flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-left',
            value === member.id
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-surface text-ink-2 hover:border-ink-3',
          )}
        >
          <SenderAvatar sender={member} className="size-8" />
          <span>
            <span className="block text-xs leading-4 font-semibold">{member.firstName}</span>
            <span
              className={cx(
                'block text-[11px] leading-3',
                value === member.id ? 'text-surface/70' : 'text-ink-3',
              )}
            >
              {member.role}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
