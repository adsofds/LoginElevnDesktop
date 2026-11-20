'use client'

import { useEffect, useState } from 'react'
import { demoNotificationHistory, type StudentNotification } from '@/lib/student-notifications'
import StudentApp from './StudentApp'

/** Phone-width app, full height. On a desktop browser it stays centred at phone width. */
export default function StudentAppFullScreen() {
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  useEffect(() => setNotifications(demoNotificationHistory(new Date())), [])

  return (
    <div className="min-h-dvh bg-[#09080f]">
      <div className="mx-auto h-dvh max-w-[480px] pt-[env(safe-area-inset-top)]">
        <StudentApp notifications={notifications} />
      </div>
    </div>
  )
}
