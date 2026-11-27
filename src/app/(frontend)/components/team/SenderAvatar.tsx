'use client'

import type { NotificationSender } from '@/lib/demo-team'
import { ElevnMark } from '../student-app/ui'
import { cx } from '../ui/cx'

/**
 * Team face (pixel art, no background) on an Elevn gold tile, or the plain Elevn logo.
 * Same look in the panel and in the student app.
 */
export function SenderAvatar({
  sender,
  className,
  shape = 'circle',
}: {
  sender: Pick<NotificationSender, 'avatar' | 'firstName'>
  className?: string
  shape?: 'circle' | 'rounded'
}) {
  const round = shape === 'circle' ? 'rounded-full' : 'rounded-[28%]'
  if (!sender.avatar) {
    return (
      <span
        aria-hidden
        className={cx(
          'grid shrink-0 place-items-center bg-[#0d0a21] text-[#c5bb83] ring-1 ring-[#c5bb83]/40',
          round,
          className,
        )}
      >
        <ElevnMark className="w-[62%]" />
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className={cx(
        'relative block shrink-0 overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#e3d9a4_0%,#c5bb83_38%,#6b6133_100%)] ring-1 ring-[#c5bb83]/50',
        round,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sender.avatar}
        alt=""
        className="absolute inset-0 size-full object-cover [image-rendering:pixelated]"
      />
    </span>
  )
}
