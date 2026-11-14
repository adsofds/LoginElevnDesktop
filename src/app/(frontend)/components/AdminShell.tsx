'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { studentDirectory } from './StudentsWorkspace'
import { Count, Kbd } from './ui/Badge'
import { Button } from './ui/Button'
import { cx } from './ui/cx'
import { Icon } from './ui/icons'
import { Menu } from './ui/Menu'
import { Sheet } from './ui/Sheet'
import { CommandPalette } from './panel/CommandPalette'
import { createActions } from './panel/createActions'
import {
  panelHref,
  sectionFromPathname,
  sectionGroups,
  sections,
  type SectionId,
} from './panel/navigation'
import { NotificationsPopover } from './panel/NotificationsPopover'
import { usePanel } from './panel/PanelState'

const COLLAPSED_KEY = 'elevn-sidebar-collapsed'
const pendingCheckins = studentDirectory.filter(
  (student) => student.checkinState !== 'Realizado',
).length

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return (
    !!element &&
    (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName))
  )
}

/* ---------- Sidebar ---------- */

function SidebarNav({
  collapsed,
  counts,
  onNavigate,
}: {
  collapsed: boolean
  counts: Partial<Record<SectionId, number>>
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = sectionFromPathname(pathname)

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-6">
      {sectionGroups.map((group) => (
        <div key={group} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.06em] text-white/35 uppercase">
              {group}
            </p>
          )}
          {sections
            .filter((section) => section.group === group)
            .map((section) => {
              const isActive = active?.id === section.id
              const content = (
                <>
                  <Icon
                    name={section.icon}
                    className={cx('size-[18px] shrink-0', isActive && 'text-brand-light')}
                  />
                  {!collapsed && <span className="flex-1 truncate">{section.label}</span>}
                  {!collapsed && section.comingSoon && (
                    <span className="rounded-full border border-white/12 px-2 py-0.5 text-[10px] font-semibold text-white/45">
                      Em breve
                    </span>
                  )}
                  {!collapsed && !section.comingSoon && (
                    <Count value={counts[section.id] ?? 0} tone="dark" />
                  )}
                  {collapsed && (counts[section.id] ?? 0) > 0 && (
                    <span
                      className="absolute top-2 right-2 size-1.5 rounded-full bg-brand-light"
                      aria-hidden="true"
                    />
                  )}
                </>
              )
              const classes = cx(
                'group relative flex h-10 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors duration-150',
                collapsed && 'justify-center px-0',
                section.comingSoon
                  ? 'cursor-default text-white/30'
                  : isActive
                    ? 'bg-white/[0.08] text-on-dark'
                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white',
              )
              if (section.comingSoon) {
                return (
                  <span
                    key={section.id}
                    className={classes}
                    aria-disabled="true"
                    title={collapsed ? `${section.label} (em breve)` : 'Módulo em desenvolvimento'}
                  >
                    {content}
                  </span>
                )
              }
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? section.label : undefined}
                  className={cx(
                    classes,
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light',
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className={cx(
                        'absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-light',
                        collapsed ? '-left-3' : '-left-4',
                      )}
                    />
                  )}
                  {content}
                </Link>
              )
            })}
        </div>
      ))}
    </nav>
  )
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const { user, logout } = usePanel()
  return (
    <Menu
      label="Conta"
      placement="top"
      align="start"
      className="w-full"
      header={
        <div className="mb-1 border-b border-line px-2.5 pt-1.5 pb-2.5">
          <p className="text-sm font-semibold text-ink">{user.name}</p>
          <p className="text-xs text-ink-3">Administrador master · {user.profession}</p>
        </div>
      }
      items={[
        {
          id: 'seguranca',
          label: 'Senha e segurança',
          icon: <Icon name="shield" className="size-4" />,
          onSelect: () => router.push(panelHref('/configuracoes', { aba: 'seguranca' })),
        },
        {
          id: 'tema',
          label: 'Cor do tema',
          icon: <Icon name="palette" className="size-4" />,
          onSelect: () => router.push(panelHref('/configuracoes', { aba: 'tema' })),
        },
        {
          id: 'equipe',
          label: 'Equipe e permissões',
          icon: <Icon name="team" className="size-4" />,
          onSelect: () => router.push(panelHref('/configuracoes', { aba: 'equipe' })),
        },
        {
          id: 'sair',
          label: 'Sair',
          icon: <Icon name="logout" className="size-4" />,
          onSelect: logout,
          danger: true,
        },
      ]}
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          title={collapsed ? user.name : undefined}
          className={cx(
            'flex w-full cursor-pointer items-center gap-3 rounded-control p-2 text-left transition-colors hover:bg-white/[0.06]',
            'focus-visible:outline-2 focus-visible:outline-brand-light',
            collapsed && 'justify-center',
          )}
        >
          <Image
            src={user.avatar}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
                <span className="block truncate text-xs text-white/45">{user.profession}</span>
              </span>
              <Icon name="chevronUpDown" className="size-4 text-white/40" />
            </>
          )}
        </button>
      )}
    />
  )
}

function SidebarContent({
  collapsed,
  counts,
  onNavigate,
  onToggleCollapsed,
  onClose,
}: {
  collapsed: boolean
  counts: Partial<Record<SectionId, number>>
  onNavigate?: () => void
  onToggleCollapsed?: () => void
  onClose?: () => void
}) {
  return (
    <div
      className={cx(
        'flex h-full flex-col bg-night text-white',
        'bg-[radial-gradient(circle_at_15%_92%,color-mix(in_srgb,var(--elevn-accent)_26%,transparent),transparent_36%)]',
        collapsed ? 'w-[72px] px-3' : 'w-[248px] px-4',
      )}
    >
      <div
        className={cx(
          'flex h-16 shrink-0 items-center',
          collapsed ? 'justify-center' : 'justify-between pl-2',
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="Elevn — Dashboard"
          className="flex items-center"
        >
          {collapsed ? (
            <img src="/brand/symbol-beige.png" alt="" className="size-7" />
          ) : (
            <img src="/brand/wordmark-beige.png" alt="Elevn" className="h-auto w-[96px]" />
          )}
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid size-9 cursor-pointer place-items-center rounded-control text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} counts={counts} onNavigate={onNavigate} />
      </div>

      <div className="flex shrink-0 flex-col gap-1 border-t border-white/10 py-3">
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={`${collapsed ? 'Expandir' : 'Recolher'} menu ( [ )`}
            className={cx(
              'flex h-9 cursor-pointer items-center gap-3 rounded-control px-3 text-xs font-medium text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80',
              collapsed && 'justify-center px-0',
            )}
          >
            <Icon name="sidebar" className="size-4" />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        )}
        <SidebarUser collapsed={collapsed} />
      </div>
    </div>
  )
}

/* ---------- Header ---------- */

function Breadcrumb() {
  const pathname = usePathname()
  const { trail } = usePanel()
  const section = sectionFromPathname(pathname)
  if (!section) return null
  return (
    <nav aria-label="Você está em" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li className="shrink-0">
          {trail.length ? (
            <Link
              href={section.href}
              className="font-medium text-ink-3 transition-colors hover:text-ink"
            >
              {section.label}
            </Link>
          ) : (
            <span className="font-semibold text-ink" aria-current="page">
              {section.label}
            </span>
          )}
        </li>
        {trail.map((item, index) => (
          <Fragment key={`${item}-${index}`}>
            <li aria-hidden="true" className="text-ink-3">
              <Icon name="chevronRight" className="size-3.5" />
            </li>
            <li
              className={cx(
                'truncate',
                index === trail.length - 1 ? 'font-semibold text-ink' : 'font-medium text-ink-3',
              )}
              aria-current={index === trail.length - 1 ? 'page' : undefined}
            >
              {item}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

function NewMenu() {
  const router = useRouter()
  return (
    <Menu
      label="Criar novo"
      items={createActions.map((action) => ({
        id: action.id,
        label: action.label,
        description: action.description,
        icon: <Icon name={action.icon} className="size-4" />,
        onSelect: () => router.push(action.href),
      }))}
      trigger={({ open, toggle, id }) => (
        <Button
          variant="primary"
          size="sm"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          className="h-9 px-3"
        >
          <Icon name="plus" className="size-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      )}
    />
  )
}

/* ---------- Shell ---------- */

export default function AdminShell({ children }: { children: ReactNode }) {
  const { ready, activeTheme, unreadCount } = usePanel()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === '1')
    } catch {
      /* default: expanded */
    }
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      try {
        window.localStorage.setItem(COLLAPSED_KEY, current ? '0' : '1')
      } catch {
        /* not persisted */
      }
      return !current
    })
  }

  // ⌘K / Ctrl+K opens the search; "/" too when not typing; "[" collapses the sidebar
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((current) => !current)
      } else if (!isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key === '/') {
          event.preventDefault()
          setPaletteOpen(true)
        } else if (event.key === '[') {
          toggleCollapsed()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile drawer whenever the route changes
  useEffect(() => setMobileOpen(false), [pathname])

  const counts: Partial<Record<SectionId, number>> = {
    interno: unreadCount,
    alunos: pendingCheckins,
  }

  const themeStyle = {
    '--elevn-accent': activeTheme.accentColor,
    '--elevn-accent-light': activeTheme.accentLight,
    '--elevn-sidebar-bg': activeTheme.sidebarBg,
    '--elevn-canvas-bg': activeTheme.canvasBg,
    '--sidebar-w': collapsed ? '72px' : '248px',
  } as CSSProperties

  return (
    <div className="admin-shell min-h-screen bg-canvas text-ink" style={themeStyle}>
      <a
        href="#conteudo"
        className="sr-only z-[70] rounded-control bg-night px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 ease-out-soft md:block">
        <SidebarContent collapsed={collapsed} counts={counts} onToggleCollapsed={toggleCollapsed} />
      </aside>

      <Sheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        label="Menu"
        className="md:hidden"
      >
        <SidebarContent
          collapsed={false}
          counts={counts}
          onNavigate={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
        />
      </Sheet>

      <div className="min-w-0 transition-[padding] duration-200 ease-out-soft md:pl-[var(--sidebar-w)]">
        <header
          className={cx(
            'sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md transition-colors md:px-8 lg:px-10',
            'bg-[color-mix(in_srgb,var(--elevn-canvas-bg)_82%,transparent)]',
            scrolled ? 'border-line' : 'border-transparent',
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="grid size-9 cursor-pointer place-items-center rounded-control border border-line bg-surface text-ink md:hidden"
          >
            <Icon name="menu" />
          </button>

          <div className="min-w-0 flex-1">
            <Breadcrumb />
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Buscar (Ctrl+K)"
            className={cx(
              'flex h-9 cursor-pointer items-center gap-2 rounded-control border border-line bg-surface text-sm text-ink-3 transition-colors hover:border-ink-3',
              'w-9 justify-center lg:w-72 lg:justify-start lg:px-3',
            )}
          >
            <Icon name="search" className="size-4 shrink-0" />
            <span className="hidden flex-1 text-left lg:inline">
              Buscar alunos, leads, páginas…
            </span>
            <span className="hidden lg:inline-flex">
              <Kbd>⌘K</Kbd>
            </span>
          </button>

          <NewMenu />
          <NotificationsPopover />
        </header>

        <main
          id="conteudo"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-14 outline-none md:px-8 lg:px-10"
        >
          {ready ? (
            children
          ) : (
            <div aria-busy="true" aria-label="Carregando" className="flex flex-col gap-4">
              <div className="h-8 w-64 animate-pulse rounded-control bg-line-subtle" />
              <div className="h-40 animate-pulse rounded-card bg-line-subtle" />
            </div>
          )}
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
