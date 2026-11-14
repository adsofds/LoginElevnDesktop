'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  initialInternalUpdates,
  initialSiteFormSubmissions,
  type InternalUpdate,
  type InternalUpdateReply,
  type LeadTemperature,
  type SiteFormSubmission,
} from '@/lib/demo-internal'
import { presetThemes, type ThemeConfig } from '../SettingsWorkspace'

/* Demo session. Real authentication (Payload `users`) is a later phase; until then the
   flag only keeps the demo logged in across reloads and new tabs on this browser. */
export const DEMO_SESSION_KEY = 'elevn-demo-session'
const THEME_KEY = 'elevn-theme'

export function readDemoSession() {
  try {
    return window.localStorage.getItem(DEMO_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function writeDemoSession(active: boolean) {
  try {
    if (active) window.localStorage.setItem(DEMO_SESSION_KEY, '1')
    else window.localStorage.removeItem(DEMO_SESSION_KEY)
  } catch {
    /* storage unavailable (private mode): the session lasts until reload */
  }
}

export type WorkoutReplyPayload = {
  studentId: string
  studentName: string
  studentAvatar: string
  workoutCode: 'Treino A' | 'Treino B' | 'Treino C'
  workoutTitle: string
  studentComment: string
  adminReply: string
}

type PanelState = {
  ready: boolean
  user: { name: string; profession: string; avatar: string }
  currentDate: string
  trail: string[]
  setTrail: (trail: string[]) => void
  internalUpdates: InternalUpdate[]
  unreadCount: number
  toggleInternalUpdate: (id: string) => void
  markInternalUpdateRead: (id: string, unread?: boolean) => void
  markAllInternalUpdatesRead: () => void
  replyInternalUpdate: (id: string, reply: InternalUpdateReply) => void
  createInternalUpdate: (update: InternalUpdate) => void
  sendWorkoutReplyToInternal: (payload: WorkoutReplyPayload) => void
  siteForms: SiteFormSubmission[]
  updateSiteFormTemperature: (id: string, temperature: LeadTemperature) => void
  createSiteFormSubmission: (submission: SiteFormSubmission) => void
  activeTheme: ThemeConfig
  setActiveTheme: (theme: ThemeConfig) => void
  logout: () => void
}

const PanelContext = createContext<PanelState | null>(null)

export function usePanel() {
  const value = useContext(PanelContext)
  if (!value) throw new Error('usePanel must be used inside <PanelProvider>')
  return value
}

/** Sets the breadcrumb shown in the header for the current view. */
export function useTrail(trail: string[]) {
  const { setTrail } = usePanel()
  const key = trail.join('\u0000')
  useEffect(() => {
    setTrail(key ? key.split('\u0000') : [])
  }, [key, setTrail])
}

const user = {
  name: 'Breno Monteiro',
  profession: 'Personal Trainer',
  avatar: '/people/breno-monteiro.png',
}

function formatToday() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())
}

/**
 * State shared by every panel route. It lives in the (painel) layout, so it survives
 * navigation between sections: inbox, leads and theme no longer reset when you switch pages.
 */
export function PanelProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [trail, setTrailState] = useState<string[]>([])
  const [internalUpdates, setInternalUpdates] = useState(initialInternalUpdates)
  const [siteForms, setSiteForms] = useState<SiteFormSubmission[]>(initialSiteFormSubmissions)
  const [activeTheme, setActiveThemeState] = useState<ThemeConfig>(presetThemes[0])

  // Session guard + per-browser preferences (client only, after hydration)
  useEffect(() => {
    if (!readDemoSession()) {
      router.replace('/')
      return
    }
    try {
      const stored = window.localStorage.getItem(THEME_KEY)
      if (stored) setActiveThemeState({ ...presetThemes[0], ...JSON.parse(stored) })
    } catch {
      /* ignore a corrupt or unavailable theme preference */
    }
    setCurrentDate(formatToday())
    setReady(true)
  }, [router])

  const setTrail = useCallback((next: string[]) => setTrailState(next), [])

  const setActiveTheme = useCallback((theme: ThemeConfig) => {
    setActiveThemeState(theme)
    try {
      window.localStorage.setItem(THEME_KEY, JSON.stringify(theme))
    } catch {
      /* preference not persisted */
    }
  }, [])

  const toggleInternalUpdate = useCallback((updateId: string) => {
    setInternalUpdates((current) =>
      current.map((update) =>
        update.id === updateId
          ? { ...update, completed: !update.completed, unread: false }
          : update,
      ),
    )
  }, [])

  const markInternalUpdateRead = useCallback((updateId: string, unread = false) => {
    setInternalUpdates((current) =>
      current.map((update) => (update.id === updateId ? { ...update, unread } : update)),
    )
  }, [])

  const markAllInternalUpdatesRead = useCallback(() => {
    setInternalUpdates((current) => current.map((update) => ({ ...update, unread: false })))
  }, [])

  const replyInternalUpdate = useCallback((updateId: string, reply: InternalUpdateReply) => {
    setInternalUpdates((current) => {
      const target = current.find((update) => update.id === updateId)
      if (!target) return current
      const updatedItem: InternalUpdate = {
        ...target,
        time: 'Agora',
        unread: false,
        replies: [...(target.replies ?? []), reply],
      }
      return [updatedItem, ...current.filter((update) => update.id !== updateId)]
    })
  }, [])

  const createInternalUpdate = useCallback((update: InternalUpdate) => {
    setInternalUpdates((current) => [update, ...current])
  }, [])

  const sendWorkoutReplyToInternal = useCallback((payload: WorkoutReplyPayload) => {
    const threadId = `workout-comment-${payload.studentId}-${payload.workoutCode.replace(/\s+/g, '-').toLowerCase()}`
    const nameParts = payload.studentName.trim().split(/\s+/)
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0] ?? 'A'}${nameParts[nameParts.length - 1][0] ?? 'L'}`.toUpperCase()
        : (nameParts[0]?.slice(0, 2) || 'AL').toUpperCase()

    const newReply: InternalUpdateReply = {
      id: `reply-${Date.now()}`,
      author: user.name,
      avatar: user.avatar,
      role: user.profession,
      time: 'Agora',
      message: payload.adminReply,
    }

    setInternalUpdates((current) => {
      const existing = current.find((item) => item.id === threadId)
      if (existing) {
        const updated: InternalUpdate = {
          ...existing,
          time: 'Respondido agora',
          unread: false,
          replies: [...(existing.replies ?? []), newReply],
        }
        return [updated, ...current.filter((item) => item.id !== threadId)]
      }
      const created: InternalUpdate = {
        id: threadId,
        author: payload.studentName,
        initials,
        avatar: payload.studentAvatar,
        role: 'Aluno',
        time: 'Respondido agora',
        subject: `Comentário no ${payload.workoutCode} (MFIT) · ${payload.workoutTitle}`,
        message: payload.studentComment,
        audience: user.name,
        recipientCategory: 'aluno',
        type: 'Mensagem',
        completed: false,
        unread: false,
        replies: [newReply],
      }
      return [created, ...current]
    })
  }, [])

  const updateSiteFormTemperature = useCallback((formId: string, temperature: LeadTemperature) => {
    setSiteForms((current) =>
      current.map((item) => (item.id === formId ? { ...item, temperature } : item)),
    )
  }, [])

  const createSiteFormSubmission = useCallback((submission: SiteFormSubmission) => {
    setSiteForms((current) => [submission, ...current])
  }, [])

  const logout = useCallback(() => {
    writeDemoSession(false)
    router.push('/')
  }, [router])

  const unreadCount = internalUpdates.filter((update) => update.unread).length

  const value = useMemo<PanelState>(
    () => ({
      ready,
      user,
      currentDate,
      trail,
      setTrail,
      internalUpdates,
      unreadCount,
      toggleInternalUpdate,
      markInternalUpdateRead,
      markAllInternalUpdatesRead,
      replyInternalUpdate,
      createInternalUpdate,
      sendWorkoutReplyToInternal,
      siteForms,
      updateSiteFormTemperature,
      createSiteFormSubmission,
      activeTheme,
      setActiveTheme,
      logout,
    }),
    [
      ready,
      currentDate,
      trail,
      setTrail,
      internalUpdates,
      unreadCount,
      toggleInternalUpdate,
      markInternalUpdateRead,
      markAllInternalUpdatesRead,
      replyInternalUpdate,
      createInternalUpdate,
      sendWorkoutReplyToInternal,
      siteForms,
      updateSiteFormTemperature,
      createSiteFormSubmission,
      activeTheme,
      setActiveTheme,
      logout,
    ],
  )

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
}
