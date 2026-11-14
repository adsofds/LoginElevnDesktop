'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatPersonName } from '@/lib/demo-internal'
import { studentDirectory } from '../StudentsWorkspace'
import { Kbd } from '../ui/Badge'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { clubTabs, configTabs, internoTabs, panelHref, sections } from './navigation'
import { usePanel } from './PanelState'
import { createActions } from './createActions'

type Command = {
  id: string
  group: 'Páginas' | 'Alunos' | 'Leads do site' | 'Criar'
  label: string
  hint?: string
  icon: string
  avatar?: string
  href: string
  keywords?: string
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/**
 * ⌘K / Ctrl+K: jump to any page, tab, student or site lead, or start a "create" flow.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const { siteForms } = usePanel()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = sections
      .filter((section) => !section.comingSoon)
      .map((section) => ({
        id: `page-${section.id}`,
        group: 'Páginas',
        label: section.label,
        icon: section.icon,
        href: section.href,
      }))
    const tabs: Command[] = [
      ...internoTabs.map((tab) => ({
        ...tab,
        base: '/interno',
        parent: 'Interno',
        icon: 'internal',
      })),
      ...clubTabs.map((tab) => ({ ...tab, base: '/club', parent: 'Elevn Club', icon: 'creation' })),
      ...configTabs.map((tab) => ({
        ...tab,
        base: '/configuracoes',
        parent: 'Configurações',
        icon: 'settings',
      })),
    ].map((tab) => ({
      id: `tab-${tab.base}-${tab.id}`,
      group: 'Páginas' as const,
      label: tab.label,
      hint: tab.parent,
      icon: tab.icon,
      href: panelHref(tab.base, { aba: tab.id }),
    }))
    const students: Command[] = studentDirectory.map((student) => ({
      id: `student-${student.id}`,
      group: 'Alunos',
      label: student.name,
      hint: `${student.goal} · Plano ${student.plan}`,
      icon: 'students',
      avatar: student.avatar,
      href: panelHref('/alunos', { ficha: student.id }),
    }))
    const leads: Command[] = siteForms.map((lead) => ({
      id: `lead-${lead.id}`,
      group: 'Leads do site',
      label: formatPersonName(lead.name),
      hint: `${lead.temperature} · ${lead.phone}`,
      icon: 'form',
      href: panelHref('/interno', { aba: 'formulario', busca: lead.name }),
      keywords: `${lead.instagram} ${lead.phone}`,
    }))
    const create: Command[] = createActions.map((action) => ({
      id: `create-${action.id}`,
      group: 'Criar',
      label: action.label,
      hint: action.description,
      icon: action.icon,
      href: action.href,
    }))
    return [...pages, ...tabs, ...students, ...leads, ...create]
  }, [siteForms])

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) {
      // Without a query, show pages, the first students and the create actions
      return commands.filter((command) => command.group !== 'Leads do site').slice(0, 24)
    }
    return commands
      .filter((command) =>
        normalize(`${command.label} ${command.hint ?? ''} ${command.keywords ?? ''}`).includes(q),
      )
      .slice(0, 30)
  }, [commands, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const id = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const run = (command: Command | undefined) => {
    if (!command) return
    onClose()
    router.push(command.href)
  }

  if (!open) return null

  let lastGroup = ''

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar busca"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-night/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca rápida"
        className="relative w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface shadow-modal animate-[menu-in_160ms_var(--ease-out-soft)] motion-reduce:animate-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          } else if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((index) => Math.min(index + 1, results.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter') {
            event.preventDefault()
            run(results[activeIndex])
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="size-[18px] text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar alunos, leads, páginas ou ações…"
            aria-label="Buscar"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={
              results[activeIndex] ? `command-${results[activeIndex].id}` : undefined
            }
            className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div
          ref={listRef}
          id="command-results"
          role="listbox"
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-ink-3">
              Nada encontrado para “{query}”.
            </p>
          )}
          {results.map((command, index) => {
            const showGroup = command.group !== lastGroup
            lastGroup = command.group
            return (
              <div key={command.id}>
                {showGroup && (
                  <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    {command.group}
                  </p>
                )}
                <button
                  id={`command-${command.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  data-index={index}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => run(command)}
                  className={cx(
                    'flex w-full cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2 text-left',
                    index === activeIndex ? 'bg-subtle' : '',
                  )}
                >
                  {command.avatar ? (
                    <img src={command.avatar} alt="" className="size-7 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-7 place-items-center rounded-[8px] border border-line text-ink-3">
                      <Icon name={command.icon} className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {command.label}
                    </span>
                    {command.hint && (
                      <span className="block truncate text-xs text-ink-3">{command.hint}</span>
                    )}
                  </span>
                  {index === activeIndex && (
                    <Icon name="arrowRight" className="size-4 text-ink-3" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-line bg-subtle px-4 py-2.5 text-xs text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navegar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Enter</Kbd> abrir
          </span>
        </div>
      </div>
    </div>
  )
}
