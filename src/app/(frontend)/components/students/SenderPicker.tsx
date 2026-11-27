'use client'

import { team, type TeamMemberId } from '@/lib/demo-team'
import type { NotificationTemplateId } from '@/lib/student-notifications'
import { cx } from '../ui/cx'

/** Suggested sender for each template (the student sees this face next to the notice). */
export const defaultSender: Record<NotificationTemplateId, TeamMemberId> = {
  treino: 'breno',
  dieta: 'athison',
  checkin: 'yasmin',
  plano: 'yasmin',
  livre: 'breno',
}

/** "Quem envia": the three team faces; the chosen one appears next to the notice. */
export function SenderPicker({
  value,
  onChange,
}: {
  value: TeamMemberId
  onChange: (id: TeamMemberId) => void
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Quem envia">
      {team.map((member) => (
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={member.avatar}
            alt=""
            className="size-8 rounded-full object-cover [image-rendering:pixelated]"
          />
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
