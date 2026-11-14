'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  permissionDefinitions,
  rolePresetPermissions,
  type EmployeeMember,
  type EmployeePermissionKey,
  type EmployeePermissions,
} from '../SettingsWorkspace'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Segmented } from '../ui/Segmented'
import { Switch } from '../ui/Switch'

const groups: { title: string; keys: EmployeePermissionKey[] }[] = [
  { title: 'Operação', keys: ['viewDashboard', 'manageStudents', 'manageInternal'] },
  { title: 'Comercial', keys: ['manageSiteForms', 'viewFinancials'] },
  { title: 'Prescrição', keys: ['editWorkouts', 'editNutrition'] },
  { title: 'Conteúdo', keys: ['manageElevnClub'] },
  { title: 'Sistema', keys: ['manageSettings'] },
]

// Listed here (not derived from permissionDefinitions) because this module and
// SettingsWorkspace import each other; module-level reads would hit the TDZ.
const allKeys: EmployeePermissionKey[] = [
  'viewDashboard',
  'viewFinancials',
  'manageSiteForms',
  'manageStudents',
  'editWorkouts',
  'editNutrition',
  'manageInternal',
  'manageElevnClub',
  'manageSettings',
]
const shortTitle: Record<EmployeePermissionKey, string> = {
  viewDashboard: 'Dashboard',
  viewFinancials: 'Financeiro',
  manageSiteForms: 'Leads',
  manageStudents: 'Alunos',
  editWorkouts: 'Treino',
  editNutrition: 'Dieta',
  manageInternal: 'Interno',
  manageElevnClub: 'Club',
  manageSettings: 'Config.',
}

/** "Função" presets. Built lazily: this module and SettingsWorkspace import each other. */
function functionPresets(): { id: string; label: string; permissions: EmployeePermissions }[] {
  const all = Object.fromEntries(allKeys.map((key) => [key, true])) as EmployeePermissions
  const readOnly = Object.fromEntries(
    allKeys.map((key) => [key, key === 'viewDashboard' || key === 'manageInternal']),
  ) as EmployeePermissions
  return [
    {
      id: 'nutricao',
      label: 'Nutrição',
      permissions: rolePresetPermissions['Nutricionista Esportiva'],
    },
    { id: 'treino', label: 'Treino', permissions: rolePresetPermissions['Treinador Assistente'] },
    {
      id: 'comercial',
      label: 'Comercial',
      permissions: rolePresetPermissions['Comercial & Closer (SDR)'],
    },
    {
      id: 'conteudo',
      label: 'Conteúdo',
      permissions: rolePresetPermissions['Social Media & Conteúdo'],
    },
    { id: 'leitura', label: 'Somente leitura', permissions: readOnly },
    { id: 'total', label: 'Acesso total', permissions: all },
  ]
}

const samePermissions = (a: EmployeePermissions, b: EmployeePermissions) =>
  allKeys.every((key) => a[key] === b[key])

type LogEntry = { text: string; at: string }

export default function TeamPermissions({
  employees,
  selectedId,
  onSelect,
  onSave,
  onToggleStatus,
  onRemove,
  onNewEmployee,
  adminName,
}: {
  employees: EmployeeMember[]
  selectedId: string
  onSelect: (id: string) => void
  onSave: (id: string, permissions: EmployeePermissions) => void
  onToggleStatus: (id: string) => void
  onRemove: (id: string) => void
  onNewEmployee: () => void
  adminName: string
}) {
  const [view, setView] = useState<'pessoa' | 'matriz'>('pessoa')
  const [search, setSearch] = useState('')
  const [pendingSensitive, setPendingSensitive] = useState<EmployeePermissionKey | null>(null)
  const [log, setLog] = useState<Record<string, LogEntry[]>>({})
  const [confirmName, setConfirmName] = useState('')
  const selected = employees.find((item) => item.id === selectedId) ?? employees[0] ?? null
  const [draft, setDraft] = useState<EmployeePermissions | null>(selected?.permissions ?? null)
  const presets = useMemo(functionPresets, [])

  useEffect(() => {
    setDraft(selected?.permissions ?? null)
    setPendingSensitive(null)
    setConfirmName('')
  }, [selected?.id, selected?.permissions])

  if (!selected || !draft) return null

  const dirtyKeys = allKeys.filter((key) => draft[key] !== selected.permissions[key])
  const dirty = dirtyKeys.length > 0
  const currentFunction =
    presets.find((preset) => samePermissions(preset.permissions, draft))?.id ?? 'personalizado'
  const firstName = selected.name.replace(/^(Dra?\.|Prof\.)\s*/, '').split(' ')[0]
  const query = search.trim().toLowerCase()
  const visibleEmployees = employees.filter(
    (emp) => !query || `${emp.name} ${emp.role} ${emp.email}`.toLowerCase().includes(query),
  )

  const setPermission = (key: EmployeePermissionKey, value: boolean) => {
    const definition = permissionDefinitions.find((item) => item.key === key)
    if (value && definition?.critical && !draft[key]) {
      setPendingSensitive(key)
      return
    }
    setDraft({ ...draft, [key]: value })
  }

  const trySelect = (id: string) => {
    if (id === selected.id) return
    if (dirty && !window.confirm(`Descartar as alterações não salvas de ${selected.name}?`)) return
    onSelect(id)
  }

  const save = () => {
    const stamp = new Date().toISOString()
    const entries = dirtyKeys.map((key) => {
      const title = permissionDefinitions.find((item) => item.key === key)?.area ?? key
      return {
        text: `${title} ${draft[key] ? 'liberado' : 'bloqueado'} por ${adminName}`,
        at: stamp,
      }
    })
    setLog((current) => ({
      ...current,
      [selected.id]: [...entries, ...(current[selected.id] ?? [])],
    }))
    onSave(selected.id, draft)
  }

  const timeFormat = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h2 className="text-xl leading-7 font-semibold text-ink">Equipe e permissões</h2>
          <p className="text-sm text-ink-2">
            {employees.length} pessoas · o que cada uma pode ver e fazer no painel
          </p>
        </div>
        <Segmented
          label="Visualização das permissões"
          size="sm"
          items={[
            { id: 'pessoa' as const, label: 'Por pessoa' },
            { id: 'matriz' as const, label: 'Matriz' },
          ]}
          value={view}
          onChange={setView}
        />
        <Button variant="accent" onClick={onNewEmployee}>
          <Icon name="userPlus" className="size-4" /> Cadastrar funcionário
        </Button>
      </div>

      {view === 'matriz' ? (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-subtle text-left text-xs text-ink-2">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Pessoa
                </th>
                {permissionDefinitions.map((item) => (
                  <th
                    key={item.key}
                    scope="col"
                    className="px-2 py-2.5 text-center font-medium"
                    title={item.title}
                  >
                    {shortTitle[item.key]}
                    {item.critical && (
                      <Icon name="key" className="ml-0.5 inline size-3 text-ink-3" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-line-subtle">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => {
                        setView('pessoa')
                        trySelect(emp.id)
                      }}
                    >
                      {emp.name}
                    </button>
                    <span className="block text-xs font-normal text-ink-3">{emp.role}</span>
                  </th>
                  {permissionDefinitions.map((item) => (
                    <td key={item.key} className="px-2 py-2.5 text-center">
                      {emp.permissions[item.key] ? (
                        <>
                          <Icon name="check" className="mx-auto size-4 text-success" />
                          <span className="sr-only">Liberado</span>
                        </>
                      ) : (
                        <span className="text-ink-3/60" aria-label="Bloqueado">
                          –
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-2">
            <label className="relative block">
              <span className="sr-only">Buscar funcionário</span>
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar pessoa ou função"
                className="h-9 w-full rounded-control border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
              />
            </label>
            <ul className="space-y-1.5" aria-label="Funcionários">
              {visibleEmployees.map((emp) => {
                const enabled = allKeys.filter((key) => emp.permissions[key]).length
                const isSelected = emp.id === selected.id
                return (
                  <li key={emp.id}>
                    <button
                      type="button"
                      aria-current={isSelected ? 'true' : undefined}
                      onClick={() => trySelect(emp.id)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-card border p-3 text-left transition-colors',
                        isSelected
                          ? 'border-brand/40 bg-brand-soft/40'
                          : 'border-line bg-surface hover:bg-subtle',
                        emp.status === 'Pausado' && 'opacity-70',
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={emp.avatar}
                        alt=""
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-ink">{emp.name}</span>
                          {emp.status === 'Pausado' && <Badge tone="warning">Pausado</Badge>}
                        </span>
                        <span className="block truncate text-xs text-ink-2">{emp.role}</span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span
                            className="h-1 flex-1 overflow-hidden rounded-full bg-subtle"
                            aria-hidden="true"
                          >
                            <span
                              className="block h-full rounded-full bg-brand"
                              style={{ width: `${(enabled / allKeys.length) * 100}%` }}
                            />
                          </span>
                          <span className="text-[11px] text-ink-3 tabular-nums">
                            {enabled}/{allKeys.length}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
              {visibleEmployees.length === 0 && (
                <li className="px-2 py-6 text-center text-sm text-ink-3">Ninguém encontrado.</li>
              )}
            </ul>
          </aside>

          <section
            className="min-w-0 rounded-card border border-line bg-surface"
            aria-label={`Permissões de ${selected.name}`}
          >
            <header className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.avatar} alt="" className="size-12 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-ink">{selected.name}</span>
                  <Badge tone={selected.status === 'Ativo' ? 'success' : 'warning'} dot>
                    {selected.status}
                  </Badge>
                </p>
                <p className="truncate text-xs text-ink-2">
                  {selected.email} · {selected.phone} ·{' '}
                  <span className="font-mono">{selected.accessCode}</span>
                </p>
              </div>
              <label className="text-xs font-medium text-ink-2">
                Função
                <select
                  value={currentFunction}
                  onChange={(event) => {
                    const preset = presets.find((item) => item.id === event.target.value)
                    if (preset) setDraft({ ...preset.permissions })
                  }}
                  className="mt-1 block h-9 rounded-control border border-line bg-surface px-2.5 text-sm text-ink focus:border-brand focus:outline-none"
                >
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                  <option value="personalizado" disabled={currentFunction !== 'personalizado'}>
                    Personalizado
                  </option>
                </select>
              </label>
            </header>

            <div className="divide-y divide-line-subtle">
              {groups.map((group) => (
                <fieldset key={group.title} className="px-5 py-3">
                  <legend className="float-left mb-1 w-full pt-1 text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    {group.title}
                  </legend>
                  {group.keys.map((key) => {
                    const definition = permissionDefinitions.find((item) => item.key === key)!
                    const changed = draft[key] !== selected.permissions[key]
                    return (
                      <div key={key} className="clear-both">
                        <div className="flex min-h-14 items-center gap-4 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                              {definition.critical && (
                                <>
                                  <Icon name="key" className="size-3.5 text-warning" />
                                  <span className="sr-only">Permissão sensível:</span>
                                </>
                              )}
                              {definition.title}
                              {changed && (
                                <span className="rounded bg-brand-soft px-1.5 text-[11px] font-medium text-brand">
                                  alterado
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[13px] leading-5 text-ink-2">
                              {definition.description}
                            </p>
                          </div>
                          <Switch
                            checked={draft[key]}
                            onChange={(value) => setPermission(key, value)}
                            label={definition.title}
                          />
                        </div>
                        {pendingSensitive === key && (
                          <div
                            role="alertdialog"
                            aria-label="Confirmar permissão sensível"
                            className="mb-2 flex flex-wrap items-center gap-3 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm text-ink"
                          >
                            <Icon name="key" className="size-4 text-warning" />
                            <span className="flex-1">
                              {key === 'viewFinancials'
                                ? `${firstName} passará a ver receita e valores de planos.`
                                : `${firstName} poderá mudar configurações, tema e permissões da equipe.`}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingSensitive(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setDraft({ ...draft, [key]: true })
                                setPendingSensitive(null)
                              }}
                            >
                              Liberar mesmo assim
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </fieldset>
              ))}
            </div>

            <div className="border-t border-line px-5 py-4">
              <h3 className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                Registro de alterações
              </h3>
              {(log[selected.id] ?? []).length === 0 ? (
                <p className="mt-1.5 text-xs text-ink-3">
                  Nenhuma alteração nesta sessão. {selected.createdAt}.
                </p>
              ) : (
                <ul className="mt-1.5 space-y-1 text-xs text-ink-2">
                  {log[selected.id].slice(0, 6).map((entry, index) => (
                    <li key={index}>
                      {entry.text} ·{' '}
                      <span className="text-ink-3">{timeFormat.format(new Date(entry.at))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-line px-5 py-4">
              <h3 className="text-sm font-semibold text-danger">Zona de risco</h3>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button size="sm" variant="secondary" onClick={() => onToggleStatus(selected.id)}>
                  {selected.status === 'Ativo' ? 'Pausar acesso' : 'Reativar acesso'}
                </Button>
                <span className="text-xs text-ink-3">
                  Pausar mantém o cadastro e bloqueia a entrada.
                </span>
              </div>
              <label htmlFor="remove-confirm" className="mt-4 block text-xs text-ink-2">
                Para remover, digite{' '}
                <strong className="font-semibold text-ink">{selected.name}</strong>
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <input
                  id="remove-confirm"
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                  autoComplete="off"
                  className="h-8 min-w-[200px] flex-1 rounded-control border border-line bg-surface px-2.5 text-sm text-ink focus:border-danger focus:outline-none"
                />
                <Button
                  size="sm"
                  variant="danger"
                  disabled={confirmName.trim() !== selected.name}
                  onClick={() => onRemove(selected.id)}
                >
                  Remover funcionário
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {dirty && (
        <div
          role="region"
          aria-label="Alterações não salvas"
          className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-card bg-night px-4 py-3 text-sm text-on-dark shadow-pop"
        >
          <span className="mr-auto">
            <strong className="font-semibold">Alterações não salvas</strong> em {selected.name} ·{' '}
            {dirtyKeys.length} {dirtyKeys.length === 1 ? 'permissão' : 'permissões'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-on-dark hover:bg-white/10 hover:text-on-dark"
            onClick={() => setDraft(selected.permissions)}
          >
            Descartar
          </Button>
          <Button size="sm" variant="accent" onClick={save}>
            Salvar
          </Button>
        </div>
      )}
    </div>
  )
}
