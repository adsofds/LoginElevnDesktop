'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { panelHref } from '../panel/navigation'

export type PostingPerson = {
  id: string
  name: string
  role: string
  instagram: string
  whatsapp: string
  status: 'Ativo' | 'Pausado'
}

export const postingRoles = [
  'Estagiário(a) de social media',
  'Social media',
  'Designer',
  'Editor(a) de vídeo',
  'Outra função',
]

/** What to do with the goals of someone being removed. */
export type RemovalPlan = { kind: 'transfer'; to: string } | { kind: 'delete' }

const field =
  'h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand'

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function PersonForm({
  initial,
  submitLabel,
  takenNames,
  onSubmit,
  onCancel,
}: {
  initial?: PostingPerson
  submitLabel: string
  takenNames: string[]
  onSubmit: (data: Omit<PostingPerson, 'id' | 'status'>) => void
  onCancel?: () => void
}) {
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '')
      .trim()
      .replace(/\s+/g, ' ')
    if (name.length < 3) return setError('Escreva o nome da pessoa.')
    if (takenNames.some((item) => item.toLowerCase() === name.toLowerCase()))
      return setError('Já existe alguém com esse nome na equipe.')
    const instagram = String(form.get('instagram') || '')
      .trim()
      .replace(/^@+/, '')
    onSubmit({
      name,
      role: String(form.get('role') || postingRoles[0]),
      instagram: instagram ? `@${instagram}` : '',
      whatsapp: String(form.get('whatsapp') || '').trim(),
    })
    setError('')
    if (!initial) event.currentTarget.reset()
  }
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-2">Nome</span>
        <input
          name="name"
          defaultValue={initial?.name}
          placeholder="Ex.: Ana Beatriz"
          className={field}
          autoFocus={!!initial}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-2">Função</span>
        <select name="role" defaultValue={initial?.role ?? postingRoles[0]} className={field}>
          {postingRoles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-2">Instagram (opcional)</span>
        <input
          name="instagram"
          defaultValue={initial?.instagram}
          placeholder="@usuario"
          className={field}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-2">WhatsApp (opcional)</span>
        <input
          name="whatsapp"
          type="tel"
          inputMode="tel"
          defaultValue={initial?.whatsapp}
          placeholder="(84) 99999-0000"
          className={field}
        />
      </label>
      {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="primary" size="sm">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

/**
 * Who posts for Elevn: add, edit, pause and remove people. Goals and notes point to the
 * person by name, so renaming carries them along and removing asks what to do with them.
 */
export default function PostingTeam({
  people,
  goalCount,
  adding,
  onAddingChange,
  onAdd,
  onUpdate,
  onToggleStatus,
  onRemove,
  onSetGoal,
}: {
  people: PostingPerson[]
  goalCount: (name: string) => number
  adding: boolean
  onAddingChange: (adding: boolean) => void
  onAdd: (data: Omit<PostingPerson, 'id' | 'status'>) => void
  onUpdate: (id: string, data: Omit<PostingPerson, 'id' | 'status'>) => void
  onToggleStatus: (id: string) => void
  onRemove: (id: string, plan: RemovalPlan) => void
  onSetGoal: (name: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [transferTo, setTransferTo] = useState('')

  return (
    <section aria-label="Equipe de postagens" className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">
            Equipe de postagens
          </p>
          <h3 className="text-lg font-semibold text-ink">Quem posta pela Elevn</h3>
          <p className="mt-0.5 max-w-xl text-sm text-ink-2">
            Cadastre aqui as pessoas responsáveis pelas postagens. Depois defina as metas de cada
            uma na aba Metas.
          </p>
        </div>
        {!adding && (
          <Button variant="accent" onClick={() => onAddingChange(true)}>
            <Icon name="userPlus" className="size-4" />
            Adicionar pessoa
          </Button>
        )}
      </header>

      {adding && (
        <div className="rounded-card border border-brand/30 bg-surface p-4">
          <h4 className="mb-3 text-[15px] font-semibold text-ink">Nova pessoa na equipe</h4>
          <PersonForm
            submitLabel="Adicionar à equipe"
            takenNames={people.map((person) => person.name)}
            onSubmit={(data) => {
              onAdd(data)
              onAddingChange(false)
            }}
            onCancel={() => onAddingChange(false)}
          />
        </div>
      )}

      {people.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-semibold text-ink">Ninguém na equipe ainda</p>
          <p className="mt-1 text-sm text-ink-2">
            Adicione a primeira pessoa para começar a definir metas.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {people.map((person) => {
            const goals = goalCount(person.name)
            const others = people.filter((item) => item.id !== person.id)
            const paused = person.status === 'Pausado'
            return (
              <li
                key={person.id}
                className={cx(
                  'rounded-card border border-line bg-surface p-4',
                  paused && 'bg-subtle/60',
                )}
              >
                {editingId === person.id ? (
                  <>
                    <h4 className="mb-3 text-[15px] font-semibold text-ink">
                      Editar {person.name}
                    </h4>
                    <PersonForm
                      initial={person}
                      submitLabel="Salvar"
                      takenNames={others.map((item) => item.name)}
                      onSubmit={(data) => {
                        onUpdate(person.id, data)
                        setEditingId(null)
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className={cx(
                          'grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold',
                          paused ? 'bg-line text-ink-3' : 'bg-brand/15 text-brand',
                        )}
                      >
                        {initials(person.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink">{person.name}</span>
                          {paused && (
                            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                              Pausado
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-ink-2">{person.role}</p>
                        <p className="mt-0.5 text-xs text-ink-3">
                          {[person.instagram, person.whatsapp].filter(Boolean).join(' · ') ||
                            'Sem contato cadastrado'}
                        </p>
                      </div>
                      <span className="shrink-0 text-right text-xs text-ink-3">
                        <strong className="block text-lg leading-6 text-ink tabular-nums">
                          {goals}
                        </strong>
                        {goals === 1 ? 'meta' : 'metas'}
                      </span>
                    </div>

                    {removingId === person.id ? (
                      <div className="mt-3 rounded-control border border-danger/30 bg-danger-soft p-3">
                        <p className="text-sm font-semibold text-ink">
                          Remover {person.name} da equipe?
                        </p>
                        {goals > 0 ? (
                          <label className="mt-2 block text-sm text-ink-2">
                            <span className="mb-1 block">
                              {person.name.split(' ')[0]} tem {goals}{' '}
                              {goals === 1 ? 'meta' : 'metas'}. O que fazer com{' '}
                              {goals === 1 ? 'ela' : 'elas'}?
                            </span>
                            <select
                              value={transferTo}
                              onChange={(event) => setTransferTo(event.target.value)}
                              className={field}
                            >
                              {others
                                .filter((item) => item.status === 'Ativo')
                                .map((item) => (
                                  <option key={item.id} value={item.name}>
                                    Passar para {item.name}
                                  </option>
                                ))}
                              <option value="">Excluir as metas</option>
                            </select>
                          </label>
                        ) : (
                          <p className="mt-1 text-sm text-ink-2">
                            Não há metas com o nome dessa pessoa.
                          </p>
                        )}
                        <p className="mt-2 text-xs text-ink-3">
                          As anotações que ela já enviou continuam no histórico.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              onRemove(
                                person.id,
                                goals > 0 && transferTo
                                  ? { kind: 'transfer', to: transferTo }
                                  : { kind: 'delete' },
                              )
                              setRemovingId(null)
                            }}
                          >
                            Remover da equipe
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRemovingId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-line-subtle pt-3">
                        {goals === 0 && !paused && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onSetGoal(person.name)}
                          >
                            <Icon name="plus" className="size-3.5" />
                            Definir meta
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(person.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onToggleStatus(person.id)}
                        >
                          {paused ? 'Reativar' : 'Pausar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setRemovingId(person.id)
                            setTransferTo(
                              others.find((item) => item.status === 'Ativo')?.name ?? '',
                            )
                          }}
                        >
                          <Icon name="trash" className="size-3.5" />
                          Remover
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card border border-line bg-subtle px-4 py-3 text-sm text-ink-2">
        <Icon name="key" className="size-4 text-ink-3" />
        Para a pessoa entrar no painel e marcar as próprias entregas, crie o acesso dela com a
        permissão de Postagens.
        <Link
          href={panelHref('/configuracoes')}
          className="font-semibold text-brand hover:underline"
        >
          Abrir Equipe e permissões →
        </Link>
      </p>
    </section>
  )
}
