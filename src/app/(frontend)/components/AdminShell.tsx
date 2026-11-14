'use client'

import Image from 'next/image'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { DashboardLayoutItem } from '@/lib/dashboard'
import {
  initialInternalUpdates,
  initialSiteFormSubmissions,
  type InternalUpdate,
  type InternalUpdateReply,
  type LeadTemperature,
  type SiteFormSubmission,
} from '@/lib/demo-internal'
import CustomDashboard from './CustomDashboard'
import CreationWorkspace from './CreationWorkspace'
import InternalWorkspace from './InternalWorkspace'
import SettingsWorkspace, { presetThemes, type ThemeConfig } from './SettingsWorkspace'
import StudentsWorkspace from './StudentsWorkspace'

type AdminShellProps = {
  currentDate: string
  onLogout: () => void
  user: {
    name: string
    profession: string
  }
  initialLayout: DashboardLayoutItem[]
}

type NavItem = {
  label: string
  icon: string
  comingSoon?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Interno', icon: 'internal' },
  { label: 'Alunos', icon: 'students' },
  { label: 'Nutrição', icon: 'nutrition', comingSoon: true },
  { label: 'Treino', icon: 'training', comingSoon: true },
  { label: 'Elevn Club', icon: 'creation' },
  { label: 'Configurações', icon: 'settings' },
]

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    internal: (
      <>
        <path d="M4 19V8.5L12 4l8 4.5V19" />
        <path d="M8 19v-6h8v6M3 20h18" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M16 7.5a2.5 2.5 0 0 1 0 5M16.5 14c2.5.3 3.8 2 4 5" />
      </>
    ),
    nutrition: (
      <>
        <path d="M12 21c-4.5-2.8-7-6.6-7-11a5 5 0 0 1 7-4.6A5 5 0 0 1 19 10c0 4.4-2.5 8.2-7 11Z" />
        <path d="M12 5c.2-2 1.2-3.2 3-3M12 9v12" />
      </>
    ),
    training: (
      <>
        <path d="M6 9v6M3.5 10.5v3M18 9v6M20.5 10.5v3M6 12h12" />
        <rect x="1.5" y="8" width="2" height="8" rx="1" />
        <rect x="20.5" y="8" width="2" height="8" rx="1" />
      </>
    ),
    creation: (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </g>
    </svg>
  )
}

function MenuIcon({ close = false }: { close?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {close ? (
        <path
          d="m6 6 12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export default function AdminShell({
  currentDate,
  onLogout,
  user,
  initialLayout,
}: AdminShellProps) {
  const [activePage, setActivePage] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [internalUpdates, setInternalUpdates] = useState(initialInternalUpdates)
  const [siteForms, setSiteForms] = useState<SiteFormSubmission[]>(initialSiteFormSubmissions)
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(presetThemes[0])
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [internalStartSection, setInternalStartSection] = useState<
    'board' | 'updates' | 'posts' | 'forms'
  >('board')
  const [internalNavigationKey, setInternalNavigationKey] = useState(0)

  useEffect(() => {
    setInternalUpdates((current) => {
      const starterMap = new Map(initialInternalUpdates.map((item) => [item.id, item]))
      const normalized = current.map((update) => {
        const starter = starterMap.get(update.id)
        return {
          ...starter,
          ...update,
          subject:
            update.subject ||
            starter?.subject ||
            `${update.type || 'Mensagem'} para ${update.audience || 'Equipe'}`,
          recipientCategory:
            update.recipientCategory ||
            starter?.recipientCategory ||
            (update.role === 'Aluno' ? 'aluno' : 'equipe'),
          replies: update.replies ?? starter?.replies ?? [],
        }
      })
      const existingIds = new Set(normalized.map((item) => item.id))
      const missingStarters = initialInternalUpdates.filter((item) => !existingIds.has(item.id))
      return [...normalized, ...missingStarters]
    })
  }, [])

  const toggleInternalUpdate = (updateId: string) => {
    setInternalUpdates((current) =>
      current.map((update) =>
        update.id === updateId
          ? { ...update, completed: !update.completed, unread: false }
          : update,
      ),
    )
  }

  const markInternalUpdateRead = (updateId: string, unread = false) => {
    setInternalUpdates((current) =>
      current.map((update) => (update.id === updateId ? { ...update, unread } : update)),
    )
  }

  const replyInternalUpdate = (updateId: string, reply: InternalUpdateReply) => {
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
  }

  const unreadOrPendingCount = internalUpdates.filter(
    (update) => update.unread || !update.completed,
  ).length

  const selectPage = (page: string) => {
    setActivePage(page)
    if (page === 'Interno') {
      setInternalStartSection('board')
      setInternalNavigationKey((current) => current + 1)
    }
    setMenuOpen(false)
  }

  const openInternalUpdates = () => {
    setInternalStartSection('updates')
    setInternalNavigationKey((current) => current + 1)
    setActivePage('Interno')
    setNotificationOpen(false)
  }

  const openInternalForms = () => {
    setInternalStartSection('forms')
    setInternalNavigationKey((current) => current + 1)
    setActivePage('Interno')
    setNotificationOpen(false)
  }

  const updateSiteFormTemperature = (formId: string, temperature: LeadTemperature) => {
    setSiteForms((current) =>
      current.map((item) => (item.id === formId ? { ...item, temperature } : item)),
    )
  }

  const createSiteFormSubmission = (submission: SiteFormSubmission) => {
    setSiteForms((current) => [submission, ...current])
  }

  const handleStudentWorkoutReplyToInternal = (payload: {
    studentId: string
    studentName: string
    studentAvatar: string
    workoutCode: 'Treino A' | 'Treino B' | 'Treino C'
    workoutTitle: string
    studentComment: string
    adminReply: string
  }) => {
    const threadId = `workout-comment-${payload.studentId}-${payload.workoutCode.replace(/\s+/g, '-').toLowerCase()}`
    const nameParts = payload.studentName.trim().split(/\s+/)
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0] ?? 'A'}${nameParts[nameParts.length - 1][0] ?? 'L'}`.toUpperCase()
        : (nameParts[0]?.slice(0, 2) || 'AL').toUpperCase()

    const newReply: InternalUpdateReply = {
      id: `reply-${Date.now()}`,
      author: user.name,
      avatar: '/people/breno-monteiro.png',
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
  }

  const shellThemeStyle = {
    '--elevn-accent': activeTheme.accentColor,
    '--elevn-accent-light': activeTheme.accentLight,
    '--elevn-sidebar-bg': activeTheme.sidebarBg,
    '--elevn-canvas-bg': activeTheme.canvasBg,
  } as CSSProperties

  return (
    <div className="admin-shell" style={shellThemeStyle}>
      <button
        className={`admin-overlay ${menuOpen ? 'visible' : ''}`}
        type="button"
        onClick={() => setMenuOpen(false)}
        aria-label="Fechar menu"
      />

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-brand-row">
          <img src="/brand/wordmark-beige.png" alt="Elevn" />
          <button
            className="sidebar-close"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <MenuIcon close />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Navegação administrativa">
          <p>MENU PRINCIPAL</p>
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`${activePage === item.label ? 'active' : ''}${item.comingSoon ? ' coming-soon' : ''}`}
              onClick={() => !item.comingSoon && selectPage(item.label)}
              disabled={item.comingSoon}
              aria-disabled={item.comingSoon || undefined}
              title={item.comingSoon ? 'Módulo em desenvolvimento' : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {item.comingSoon && <em className="nav-soon-badge">Em breve</em>}
              {item.label === 'Dashboard' && <i aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <Image
            className="profile-avatar-image"
            src="/people/breno-monteiro.png"
            alt={`Foto de ${user.name}`}
            width={40}
            height={40}
          />
          <div>
            <strong>{user.name}</strong>
            <span>{user.profession}</span>
          </div>
          <button
            className="sidebar-logout"
            type="button"
            onClick={onLogout}
            title="Sair"
            aria-label="Sair da demonstração"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-header">
          <div className="admin-header-title">
            <button
              className="mobile-menu-button"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </button>
            <div>
              <span>Painel administrativo</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              className="notification-button"
              type="button"
              aria-label={`${unreadOrPendingCount} notificações na caixa de entrada`}
              aria-expanded={notificationOpen}
              onClick={() => setNotificationOpen((current) => !current)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 20h4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{unreadOrPendingCount}</span>
            </button>
            {notificationOpen && (
              <section className="notification-popover">
                <header>
                  <div>
                    <span>CENTRAL INTERNA</span>
                    <strong>Caixa de entrada</strong>
                  </div>
                  <small>{unreadOrPendingCount}</small>
                </header>
                <div>
                  {internalUpdates.slice(0, 5).map((update) => (
                    <button
                      key={update.id}
                      type="button"
                      onClick={() => {
                        markInternalUpdateRead(update.id, false)
                        openInternalUpdates()
                      }}
                    >
                      <img src={update.avatar} alt="" />
                      <span>
                        <strong>
                          {update.author} · {update.subject || update.type}
                        </strong>
                        <small>
                          Para: {update.audience} — {update.message}
                        </small>
                      </span>
                      <time>{update.time}</time>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={openInternalUpdates}>
                  Ver comunicação interna
                </button>
              </section>
            )}
          </div>
        </header>

        <main className="admin-content">
          {activePage === 'Dashboard' ? (
            <>
              <section className="dashboard-heading">
                <div>
                  <p>SUA MELHOR VERSÃO, ALÉM</p>
                  <h1>Visão geral da consultoria</h1>
                  <span>Organize sua visão e acompanhe o que importa na sua rotina.</span>
                </div>
                <div className="dashboard-date">
                  <small>VISÃO ATUAL</small>
                  <strong>{currentDate}</strong>
                </div>
              </section>
              <CustomDashboard
                initialLayout={initialLayout}
                internalUpdates={internalUpdates}
                onToggleInternalUpdate={toggleInternalUpdate}
                onOpenInternal={openInternalUpdates}
                siteForms={siteForms}
                onUpdateFormTemperature={updateSiteFormTemperature}
                onOpenSiteForms={openInternalForms}
              />
            </>
          ) : activePage === 'Interno' ? (
            <InternalWorkspace
              key={internalNavigationKey}
              initialSection={internalStartSection}
              updates={internalUpdates}
              onToggleUpdate={toggleInternalUpdate}
              onMarkUpdateRead={markInternalUpdateRead}
              onReplyUpdate={replyInternalUpdate}
              siteForms={siteForms}
              onUpdateFormTemperature={updateSiteFormTemperature}
              onCreateFormSubmission={createSiteFormSubmission}
              onCreateUpdate={(update: InternalUpdate) =>
                setInternalUpdates((current) => [update, ...current])
              }
            />
          ) : activePage === 'Alunos' ? (
            <StudentsWorkspace
              onSendWorkoutReplyToInternal={handleStudentWorkoutReplyToInternal}
              onOpenInternalInbox={openInternalUpdates}
            />
          ) : activePage === 'Elevn Club' ? (
            <CreationWorkspace />
          ) : activePage === 'Configurações' ? (
            <SettingsWorkspace
              adminUser={user}
              activeTheme={activeTheme}
              onSelectTheme={setActiveTheme}
            />
          ) : (
            <section className="empty-admin-page">
              <span>
                <NavIcon
                  name={navItems.find((item) => item.label === activePage)?.icon || 'dashboard'}
                />
              </span>
              <p>ESTRUTURA ADMINISTRATIVA</p>
              <h1>{activePage}</h1>
              <small>Esta área está preparada para ser construída nas próximas etapas.</small>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
