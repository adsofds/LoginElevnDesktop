'use client'

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  formatPersonName,
  formatRelativeTime,
  splitReferralOrBirth,
  type LeadTemperature,
  type SiteFormSubmission,
} from '@/lib/demo-internal'
import { Badge, Kbd, type BadgeTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { KpiStrip } from '../ui/KpiStrip'
import { Menu } from '../ui/Menu'
import { Segmented } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'

export const temperatures: LeadTemperature[] = ['Fechado', 'Quente', 'Morno', 'Frio']

export const temperatureTone: Record<LeadTemperature, BadgeTone> = {
  Fechado: 'success',
  Quente: 'danger',
  Morno: 'warning',
  Frio: 'info',
}

const temperatureHint: Record<LeadTemperature, string> = {
  Fechado: 'virou aluno',
  Quente: 'alta intenção',
  Morno: 'em avaliação',
  Frio: 'sem retorno',
}

/* ---------------------------------------------------------------- helpers */

const TIME_ZONE = 'America/Sao_Paulo'
const stampParts = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: TIME_ZONE,
})

/** "17 out 2026, 06:44" in Brasília time. */
export function formatLeadDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    stampParts.formatToParts(date).find((item) => item.type === type)?.value ?? ''
  return `${part('day')} ${part('month').replace('.', '')} ${part('year')}, ${part('hour')}:${part('minute')}`
}

const initials = (name: string) =>
  formatPersonName(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const instagramUrl = (handle: string) => {
  const clean = handle.trim().replace(/^@/, '')
  if (!clean || clean === 'nao.informado' || clean === '—' || clean.includes(' ')) return null
  return `https://instagram.com/${clean}`
}

const whatsappUrl = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`
}

function exportCsv(rows: SiteFormSubmission[]) {
  const header = [
    'Nome',
    'Telefone',
    'Instagram',
    'Indicação',
    'Nascimento',
    'Recebido em',
    'Temperatura',
  ]
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = rows.map((row) => {
    const { referral, birthDate } = splitReferralOrBirth(row.referralOrBirth)
    return [
      formatPersonName(row.name),
      row.phone,
      row.instagram,
      referral,
      birthDate,
      formatLeadDate(row.submittedAtIso),
      row.temperature,
    ]
      .map(escape)
      .join(';')
  })
  // BOM + ";" so Excel in pt-BR opens it with the right columns and accents
  const blob = new Blob([`﻿${[header.map(escape).join(';'), ...lines].join('\r\n')}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `formularios-elevn-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------- temperature picker */

export function TemperaturePicker({
  value,
  onChange,
  name,
  size = 'md',
}: {
  value: LeadTemperature
  onChange: (next: LeadTemperature) => void
  name: string
  size?: 'sm' | 'md'
}) {
  return (
    <Menu
      label={`Temperatura de ${name}`}
      align="end"
      items={temperatures.map((temperature, index) => ({
        id: temperature,
        label: temperature,
        description: temperatureHint[temperature],
        icon: (
          <span aria-hidden="true" className={cx('size-2 rounded-full', dotClass[temperature])} />
        ),
        shortcut: <Kbd>{index + 1}</Kbd>,
        onSelect: () => onChange(temperature),
      }))}
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            toggle()
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          aria-label={`Temperatura de ${name}: ${value}. Alterar`}
          className="group/temp inline-flex items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Badge
            tone={temperatureTone[value]}
            dot
            className={size === 'sm' ? 'text-[11px]' : undefined}
          >
            {value}
            <Icon
              name="chevronUpDown"
              className="-mr-0.5 size-3 opacity-50 group-hover/temp:opacity-100"
            />
          </Badge>
        </button>
      )}
    />
  )
}

const dotClass: Record<LeadTemperature, string> = {
  Fechado: 'bg-success',
  Quente: 'bg-danger',
  Morno: 'bg-warning',
  Frio: 'bg-info',
}

/* ------------------------------------------------------------- lead panel */

type HistoryEntry = { from: LeadTemperature; to: LeadTemperature; at: string }
type LeadNote = { text: string; at: string }
const NOTES_KEY = 'elevn-lead-notes'

function readNotes(): Record<string, LeadNote[]> {
  try {
    return JSON.parse(window.localStorage.getItem(NOTES_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function LeadPanel({
  lead,
  history,
  notes,
  onClose,
  onTemperatureChange,
  onAddNote,
  onConvert,
}: {
  lead: SiteFormSubmission | null
  history: HistoryEntry[]
  notes: LeadNote[]
  onClose: () => void
  onTemperatureChange: (next: LeadTemperature) => void
  onAddNote: (text: string) => void
  onConvert: () => void
}) {
  const [draft, setDraft] = useState('')
  useEffect(() => setDraft(''), [lead?.id])
  const name = lead ? formatPersonName(lead.name) : ''
  const split = lead ? splitReferralOrBirth(lead.referralOrBirth) : { referral: '', birthDate: '' }
  const wa = lead ? whatsappUrl(lead.phone) : null
  const ig = lead ? instagramUrl(lead.instagram) : null

  return (
    <Sheet
      open={!!lead}
      onClose={onClose}
      label={name ? `Lead ${name}` : 'Lead'}
      className="w-[min(440px,100vw)] bg-surface"
    >
      {lead && (
        <>
          <header className="flex items-start gap-3 border-b border-line px-6 py-5">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand"
            >
              {initials(lead.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl leading-7 font-semibold text-ink">{name}</h2>
              <p className="mt-0.5 text-xs text-ink-3">
                Recebido em {formatLeadDate(lead.submittedAtIso)} ·{' '}
                {formatRelativeTime(lead.submittedAtIso)}
              </p>
              <div className="mt-2">
                <TemperaturePicker
                  value={lead.temperature}
                  onChange={onTemperatureChange}
                  name={name}
                />
              </div>
            </div>
            <Button size="icon" variant="ghost" aria-label="Fechar lead" onClick={onClose}>
              <Icon name="close" className="size-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section aria-labelledby="lead-data">
              <h3
                id="lead-data"
                className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase"
              >
                Dados do formulário
              </h3>
              <dl className="mt-2 divide-y divide-line-subtle text-sm">
                {[
                  ['Telefone', lead.phone, wa ? { href: wa, label: 'WhatsApp' } : null],
                  ['Instagram', lead.instagram, ig ? { href: ig, label: 'Abrir' } : null],
                  ['Indicação', split.referral, null],
                  ['Nascimento', split.birthDate, null],
                ].map(([label, value, link]) => (
                  <div key={label as string} className="flex items-center gap-3 py-2">
                    <dt className="w-24 shrink-0 text-xs text-ink-3">{label as string}</dt>
                    <dd className="min-w-0 flex-1 truncate text-ink">{(value as string) || '—'}</dd>
                    {link && (
                      <a
                        href={(link as { href: string }).href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        {(link as { label: string }).label} ↗
                      </a>
                    )}
                  </div>
                ))}
              </dl>
              <p className="mt-1 text-[11px] text-ink-3" title="Valor original gravado (UTC)">
                Registro original: {lead.submittedAtIso}
              </p>
            </section>

            <section aria-labelledby="lead-history">
              <h3
                id="lead-history"
                className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase"
              >
                Histórico de temperatura
              </h3>
              <ol className="mt-2 space-y-2 border-l border-line pl-4 text-sm">
                {[...history].reverse().map((entry, index) => (
                  <li key={index} className="relative">
                    <span
                      aria-hidden="true"
                      className={cx(
                        'absolute top-1.5 -left-[21px] size-2 rounded-full',
                        dotClass[entry.to],
                      )}
                    />
                    <span className="text-ink">
                      {entry.from} → <strong className="font-semibold">{entry.to}</strong>
                    </span>
                    <span className="ml-2 text-xs text-ink-3">{formatRelativeTime(entry.at)}</span>
                  </li>
                ))}
                <li className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-ink-3"
                  />
                  <span className="text-ink">Formulário recebido pelo site</span>
                  <span className="ml-2 text-xs text-ink-3">
                    {formatLeadDate(lead.submittedAtIso)}
                  </span>
                </li>
              </ol>
            </section>

            <section aria-labelledby="lead-notes">
              <h3
                id="lead-notes"
                className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase"
              >
                Notas
              </h3>
              {notes.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {notes.map((note, index) => (
                    <li key={index} className="rounded-lg bg-subtle px-3 py-2 text-sm text-ink">
                      {note.text}
                      <span className="mt-0.5 block text-[11px] text-ink-3">
                        {formatRelativeTime(note.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <form
                className="mt-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!draft.trim()) return
                  onAddNote(draft.trim())
                  setDraft('')
                }}
              >
                <label htmlFor="lead-note" className="sr-only">
                  Nova nota
                </label>
                <textarea
                  id="lead-note"
                  rows={3}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ex.: pediu retorno na segunda depois das 18h"
                  className="w-full resize-none rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
                />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-ink-3">Salvas neste navegador</span>
                  <Button size="sm" type="submit" disabled={!draft.trim()}>
                    Salvar nota
                  </Button>
                </div>
              </form>
            </section>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
            <p className="text-xs text-ink-3">Leva nome e WhatsApp para o cadastro de aluno.</p>
            <Button variant="accent" onClick={onConvert}>
              <Icon name="userPlus" className="size-4" /> Converter em aluno
            </Button>
          </footer>
        </>
      )}
    </Sheet>
  )
}

/* ------------------------------------------------------- manual lead form */

function ManualLeadSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (lead: SiteFormSubmission) => void
}) {
  const [temperature, setTemperature] = useState<LeadTemperature>('Quente')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('lead-name') ?? '').trim()
    const phone = String(form.get('lead-phone') ?? '').trim()
    const instagram = String(form.get('lead-instagram') ?? '').trim()
    const referral = String(form.get('lead-referral') ?? '').trim()
    if (!name || !phone) return
    onCreate({
      id: `form-${Date.now().toString(36)}`,
      name,
      phone,
      instagram: instagram
        ? instagram.startsWith('@')
          ? instagram
          : `@${instagram}`
        : '@nao.informado',
      referralOrBirth: referral || 'Site Elevn (Direto)',
      submittedAtIso: new Date().toISOString(),
      temperature,
    })
    event.currentTarget.reset()
    setTemperature('Quente')
    onClose()
  }

  const field =
    'mt-1 h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none'

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label="Registrar lead manual"
      className="w-[min(440px,100vw)] bg-surface"
    >
      <form onSubmit={submit} className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl leading-7 font-semibold text-ink">Registrar lead manual</h2>
            <p className="mt-1 text-sm text-ink-2">
              Para contatos que chegaram fora do formulário do site.
            </p>
          </div>
          <Button size="icon" variant="ghost" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" className="size-4" />
          </Button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <label className="block text-xs font-medium text-ink-2">
            Nome completo
            <input name="lead-name" required placeholder="Ex.: Juliana Costa" className={field} />
          </label>
          <label className="block text-xs font-medium text-ink-2">
            Telefone / WhatsApp
            <input
              name="lead-phone"
              required
              inputMode="tel"
              placeholder="Ex.: (84) 99988-7766"
              className={field}
            />
          </label>
          <label className="block text-xs font-medium text-ink-2">
            Instagram
            <input name="lead-instagram" placeholder="Ex.: @julianacosta" className={field} />
          </label>
          <label className="block text-xs font-medium text-ink-2">
            Indicação / origem
            <input name="lead-referral" placeholder="Ex.: indicação de aluno" className={field} />
          </label>
          <div>
            <p className="text-xs font-medium text-ink-2">Temperatura</p>
            <Segmented
              className="mt-1"
              label="Temperatura do lead"
              items={temperatures.map((item) => ({ id: item, label: item }))}
              value={temperature}
              onChange={setTemperature}
            />
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent">
            Salvar na planilha
          </Button>
        </footer>
      </form>
    </Sheet>
  )
}

/* ------------------------------------------------------------ spreadsheet */

type SortKey = 'date' | 'name' | 'temperature'
export type LeadFilter = 'Todos' | LeadTemperature

export default function LeadsSpreadsheet({
  forms,
  onTemperatureChange,
  onCreate,
  onConvert,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  composerOpen,
  onComposerOpenChange,
}: {
  forms: SiteFormSubmission[]
  onTemperatureChange: (id: string, temperature: LeadTemperature) => void
  onCreate: (lead: SiteFormSubmission) => void
  onConvert: (lead: SiteFormSubmission) => void
  search: string
  onSearchChange: (value: string) => void
  filter: LeadFilter
  onFilterChange: (value: LeadFilter) => void
  composerOpen: boolean
  onComposerOpenChange: (open: boolean) => void
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'date',
    dir: 'asc',
  })
  const [selected, setSelected] = useState<string[]>([])
  const [openLeadId, setOpenLeadId] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [history, setHistory] = useState<Record<string, HistoryEntry[]>>({})
  const [notes, setNotes] = useState<Record<string, LeadNote[]>>({})

  useEffect(() => setNotes(readNotes()), [])

  const count = (temperature: LeadTemperature) =>
    forms.filter((item) => item.temperature === temperature).length
  const closed = count('Fechado')
  const conversion = forms.length ? Math.round((closed / forms.length) * 100) : 0
  const latest = forms.reduce<string | null>(
    (max, item) => (!max || item.submittedAtIso > max ? item.submittedAtIso : max),
    null,
  )

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = forms.filter((entry) => {
      if (filter !== 'Todos' && entry.temperature !== filter) return false
      if (!query) return true
      return [entry.name, entry.phone, entry.instagram, entry.referralOrBirth].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
    const order = (entry: SiteFormSubmission) =>
      sort.key === 'date'
        ? entry.submittedAtIso
        : sort.key === 'name'
          ? formatPersonName(entry.name).toLowerCase()
          : String(temperatures.indexOf(entry.temperature))
    return [...filtered].sort(
      (a, b) => order(a).localeCompare(order(b), 'pt-BR') * (sort.dir === 'asc' ? 1 : -1),
    )
  }, [forms, filter, search, sort])

  // number in the original order of arrival (oldest = 1), like the spreadsheet
  const arrival = useMemo(() => {
    const ordered = [...forms].sort((a, b) => a.submittedAtIso.localeCompare(b.submittedAtIso))
    return new Map(ordered.map((entry, index) => [entry.id, index + 1]))
  }, [forms])

  const openLead = forms.find((item) => item.id === openLeadId) ?? null
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id))

  const changeTemperature = (lead: SiteFormSubmission, next: LeadTemperature) => {
    if (lead.temperature === next) return
    onTemperatureChange(lead.id, next)
    setHistory((current) => ({
      ...current,
      [lead.id]: [
        ...(current[lead.id] ?? []),
        { from: lead.temperature, to: next, at: new Date().toISOString() },
      ],
    }))
    setFlashId(lead.id)
    window.setTimeout(() => setFlashId((current) => (current === lead.id ? null : current)), 600)
  }

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'date' ? 'desc' : 'asc' },
    )

  const toggleSelected = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )

  const addNote = (text: string) => {
    if (!openLead) return
    setNotes((current) => {
      const next = {
        ...current,
        [openLead.id]: [...(current[openLead.id] ?? []), { text, at: new Date().toISOString() }],
      }
      try {
        window.localStorage.setItem(NOTES_KEY, JSON.stringify(next))
      } catch {
        /* storage unavailable: keep in memory */
      }
      return next
    })
  }

  const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, lead: SiteFormSubmission) => {
    if (event.target !== event.currentTarget) return
    const index = ['1', '2', '3', '4'].indexOf(event.key)
    if (index >= 0) {
      event.preventDefault()
      changeTemperature(lead, temperatures[index])
    } else if (event.key === 'Enter') {
      event.preventDefault()
      setOpenLeadId(lead.id)
    } else if (event.key === ' ') {
      event.preventDefault()
      toggleSelected(lead.id)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const sibling =
        event.key === 'ArrowDown'
          ? event.currentTarget.nextElementSibling
          : event.currentTarget.previousElementSibling
      ;(sibling as HTMLElement | null)?.focus()
    }
  }

  const onRowClick = (event: MouseEvent<HTMLTableRowElement>, lead: SiteFormSubmission) => {
    if ((event.target as HTMLElement).closest('button, a, input, [role="menu"]')) return
    setOpenLeadId(lead.id)
  }

  const SortHeader = ({
    label,
    sortKey,
    className,
  }: {
    label: string
    sortKey: SortKey
    className?: string
  }) => {
    const active = sort.key === sortKey
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={className}
      >
        <button
          type="button"
          onClick={() => toggleSort(sortKey)}
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          {label}
          <span
            aria-hidden="true"
            className={cx('text-[10px]', active ? 'text-ink' : 'text-ink-3/50')}
          >
            {active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </button>
      </th>
    )
  }

  return (
    <section aria-label="Formulários preenchidos no site" className="min-w-0 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl leading-7 font-semibold text-ink">Formulários do site</h2>
          <p className="mt-0.5 text-sm text-ink-2">
            Chegam sozinhos da página de captura
            {latest && (
              <span className="text-ink-3"> · última entrada {formatRelativeTime(latest)}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => exportCsv(rows)}>
            Exportar CSV
          </Button>
          <Button variant="accent" onClick={() => onComposerOpenChange(true)}>
            <Icon name="plus" className="size-4" /> Registrar manual
          </Button>
        </div>
      </header>

      <KpiStrip
        label="Resumo dos formulários"
        columns={4}
        items={[
          {
            id: 'total',
            label: 'Total recebido',
            value: forms.length,
            hint: 'formulários enviados pelo site',
            active: filter === 'Todos',
            onClick: () => onFilterChange('Todos'),
          },
          {
            id: 'conversion',
            label: 'Conversão',
            value: `${conversion}%`,
            delta: { text: `${closed} fechados de ${forms.length}`, tone: 'success' },
            active: filter === 'Fechado',
            onClick: () => onFilterChange(filter === 'Fechado' ? 'Todos' : 'Fechado'),
          },
          {
            id: 'hot',
            label: 'Quentes',
            value: count('Quente'),
            delta: { text: 'alta intenção de fechar', tone: 'danger' },
            active: filter === 'Quente',
            onClick: () => onFilterChange(filter === 'Quente' ? 'Todos' : 'Quente'),
          },
          {
            id: 'cold',
            label: 'Mornos e frios',
            value: count('Morno') + count('Frio'),
            hint: `${count('Morno')} mornos · ${count('Frio')} frios`,
            active: filter === 'Frio',
            onClick: () => onFilterChange(filter === 'Frio' ? 'Todos' : 'Frio'),
          },
        ]}
      />

      {selected.length > 0 ? (
        <div
          role="region"
          aria-label="Ações em massa"
          className="flex flex-wrap items-center gap-3 rounded-card bg-night px-4 py-2.5 text-sm text-on-dark"
        >
          <strong className="font-semibold tabular-nums">
            {selected.length} {selected.length === 1 ? 'selecionado' : 'selecionados'}
          </strong>
          <Menu
            label="Mudar temperatura dos selecionados"
            align="start"
            items={temperatures.map((temperature) => ({
              id: temperature,
              label: temperature,
              icon: (
                <span
                  aria-hidden="true"
                  className={cx('size-2 rounded-full', dotClass[temperature])}
                />
              ),
              onSelect: () => {
                forms
                  .filter((item) => selected.includes(item.id))
                  .forEach((item) => changeTemperature(item, temperature))
              },
            }))}
            trigger={({ open, toggle, id }) => (
              <Button
                size="sm"
                variant="ghost"
                className="text-on-dark hover:bg-white/10 hover:text-on-dark"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? id : undefined}
              >
                Mudar temperatura <Icon name="chevronUpDown" className="size-3.5" />
              </Button>
            )}
          />
          <Button
            size="sm"
            variant="ghost"
            className="text-on-dark hover:bg-white/10 hover:text-on-dark"
            onClick={() => exportCsv(forms.filter((item) => selected.includes(item.id)))}
          >
            Exportar selecionados
          </Button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto text-xs text-on-dark/70 hover:text-on-dark"
          >
            Limpar seleção
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Filtrar por temperatura"
            items={[
              { id: 'Todos' as LeadFilter, label: 'Todos', count: forms.length },
              ...temperatures.map((temperature) => ({
                id: temperature as LeadFilter,
                label: temperature,
                count: count(temperature),
              })),
            ]}
            value={filter}
            onChange={onFilterChange}
          />
          <label className="relative ml-auto w-full sm:w-72">
            <span className="sr-only">Buscar leads</span>
            <Icon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nome, telefone, @ ou indicação"
              className="h-9 w-full rounded-control border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
            />
          </label>
        </div>
      )}

      <div className="max-h-[calc(100dvh-220px)] min-h-[320px] overflow-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[960px] border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-subtle text-left text-xs font-medium text-ink-2 [&_th]:border-b [&_th]:border-line [&_th]:px-3 [&_th]:py-2.5 [&_th]:font-medium">
            <tr>
              <th scope="col" className="w-10">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos os leads visíveis"
                  checked={allVisibleSelected}
                  onChange={() =>
                    setSelected(
                      allVisibleSelected
                        ? selected.filter((id) => !rows.some((row) => row.id === id))
                        : [...new Set([...selected, ...rows.map((row) => row.id)])],
                    )
                  }
                  className="size-4 accent-[var(--elevn-accent)]"
                />
              </th>
              <th scope="col" className="w-10 text-ink-3">
                #
              </th>
              <SortHeader label="Nome" sortKey="name" />
              <th scope="col" className="w-[176px]">
                Contato
              </th>
              <th scope="col" className="w-[170px]">
                Indicação
              </th>
              <th scope="col" className="w-[110px]">
                Nascimento
              </th>
              <SortHeader label="Recebido em" sortKey="date" className="w-[170px]" />
              <SortHeader label="Temperatura" sortKey="temperature" className="w-[130px]" />
            </tr>
          </thead>
          <tbody className="[&_td]:border-b [&_td]:border-line-subtle [&_td]:px-3 [&_td]:py-2">
            {rows.map((lead) => {
              const name = formatPersonName(lead.name)
              const { referral, birthDate } = splitReferralOrBirth(lead.referralOrBirth)
              const wa = whatsappUrl(lead.phone)
              const ig = instagramUrl(lead.instagram)
              const isSelected = selected.includes(lead.id)
              return (
                <tr
                  key={lead.id}
                  tabIndex={0}
                  aria-label={`${name}, ${lead.temperature}. Enter abre o lead; 1 a 4 mudam a temperatura.`}
                  onClick={(event) => onRowClick(event, lead)}
                  onKeyDown={(event) => onRowKeyDown(event, lead)}
                  className={cx(
                    'group/row h-11 cursor-pointer outline-none transition-colors duration-500',
                    'hover:bg-subtle focus-visible:bg-subtle focus-visible:[&>td:first-child]:shadow-[inset_2px_0_0_var(--elevn-accent)]',
                    isSelected && 'bg-brand-soft/40',
                    flashId === lead.id && 'bg-brand-soft',
                  )}
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Selecionar ${name}`}
                      checked={isSelected}
                      onChange={() => toggleSelected(lead.id)}
                      className="size-4 accent-[var(--elevn-accent)]"
                    />
                  </td>
                  <td className="text-xs text-ink-3 tabular-nums">{arrival.get(lead.id)}</td>
                  <td>
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-subtle text-[11px] font-semibold text-ink-2"
                      >
                        {initials(lead.name)}
                      </span>
                      <span className="max-w-[200px] truncate font-medium text-ink">{name}</span>
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-ink tabular-nums">{lead.phone}</span>
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`WhatsApp de ${name}`}
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium text-success opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-visible/row:opacity-100 focus-visible:opacity-100 hover:bg-success-soft"
                        >
                          WhatsApp
                        </a>
                      )}
                    </span>
                    {ig ? (
                      <a
                        href={ig}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-ink-3 hover:text-brand"
                      >
                        {lead.instagram}
                      </a>
                    ) : (
                      <span className="block text-xs text-ink-3">sem Instagram</span>
                    )}
                  </td>
                  <td className="max-w-[170px] truncate text-ink-2">{referral}</td>
                  <td className="text-ink-2 tabular-nums">{birthDate}</td>
                  <td title={`Registro original (UTC): ${lead.submittedAtIso}`}>
                    <span className="block whitespace-nowrap text-ink tabular-nums">
                      {formatLeadDate(lead.submittedAtIso)}
                    </span>
                    <span className="block text-xs text-ink-3">
                      {formatRelativeTime(lead.submittedAtIso)}
                    </span>
                  </td>
                  <td>
                    <TemperaturePicker
                      value={lead.temperature}
                      onChange={(next) => changeTemperature(lead, next)}
                      name={name}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink">Nenhum lead encontrado</p>
            <p className="mt-1 text-xs text-ink-3">Ajuste a busca ou o filtro de temperatura.</p>
            {(search || filter !== 'Todos') && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  onSearchChange('')
                  onFilterChange('Todos')
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>
      <p className="hidden text-xs text-ink-3 lg:flex lg:items-center lg:gap-1">
        Teclado: <Kbd>↑</Kbd>
        <Kbd>↓</Kbd> linhas · <Kbd>1</Kbd>–<Kbd>4</Kbd> temperatura · <Kbd>Enter</Kbd> abre o lead ·{' '}
        <Kbd>Espaço</Kbd> seleciona
      </p>

      <LeadPanel
        lead={openLead}
        history={openLead ? (history[openLead.id] ?? []) : []}
        notes={openLead ? (notes[openLead.id] ?? []) : []}
        onClose={() => setOpenLeadId(null)}
        onTemperatureChange={(next) => openLead && changeTemperature(openLead, next)}
        onAddNote={addNote}
        onConvert={() => {
          if (!openLead) return
          if (openLead.temperature !== 'Fechado') changeTemperature(openLead, 'Fechado')
          onConvert(openLead)
        }}
      />
      <ManualLeadSheet
        open={composerOpen}
        onClose={() => onComposerOpenChange(false)}
        onCreate={onCreate}
      />
    </section>
  )
}
