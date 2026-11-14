'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import type {
  ChallengeActivity,
  ClubTrack,
  GymRatsChallenge,
  PlaylistLessonVideo,
  StudentPlaylist,
} from '../CreationWorkspace'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Segmented } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'
import { Switch } from '../ui/Switch'

/* ------------------------------------------------------------ primitives */

export const field =
  'mt-1 h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none'

export function FormSheet({
  open,
  onClose,
  title,
  description,
  onSubmit,
  submitLabel,
  width = 'w-[min(520px,100vw)]',
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitLabel: string
  width?: string
  children: ReactNode
}) {
  return (
    <Sheet open={open} onClose={onClose} label={title} className={cx(width, 'bg-surface text-ink')}>
      <form onSubmit={onSubmit} className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl leading-7 font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          </div>
          <Button size="icon" variant="ghost" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent">
            {submitLabel}
          </Button>
        </footer>
      </form>
    </Sheet>
  )
}

function Label({ text, children, hint }: { text: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-xs font-medium text-ink-2">
      {text}
      {children}
      {hint && <span className="mt-1 block text-[11px] font-normal text-ink-3">{hint}</span>}
    </label>
  )
}

const readImage = (event: ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => typeof reader.result === 'string' && setter(reader.result)
  reader.readAsDataURL(file)
}

/** 4:3 cover with presets and upload (the crop is fixed so the phone grid stays aligned). */
function CoverPicker({
  value,
  onChange,
  presets,
}: {
  value: string
  onChange: (url: string) => void
  presets: { label: string; url: string }[]
}) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-2">Capa 4:3</p>
      <div className="mt-1 aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-lg border border-line bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Capa escolhida" className="size-full object-cover" />
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {presets.map((preset) => (
          <button
            key={preset.url}
            type="button"
            title={preset.label}
            onClick={() => onChange(preset.url)}
            className={cx(
              'h-10 w-14 shrink-0 overflow-hidden rounded-md border-2',
              value === preset.url
                ? 'border-brand'
                : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preset.url} alt={preset.label} className="size-full object-cover" />
          </button>
        ))}
        <label className="grid h-10 w-14 shrink-0 cursor-pointer place-items-center rounded-md border border-dashed border-line text-ink-3 hover:text-ink">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => readImage(event, onChange)}
          />
          <Icon name="plus" className="size-4" />
          <span className="sr-only">Enviar capa</span>
        </label>
      </div>
      <p className="mt-1 text-[11px] text-ink-3">
        Recomendado 1440 × 1080 px. Deixe o terço inferior livre para o título.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ activities */

export const activityIcons = ['🏋️', '🏃', '🥗', '💧', '✅', '😴', '👟', '📖', '🧘', '🔥']

export const elevnActivityTemplate = (): ChallengeActivity[] => [
  {
    id: `act-${crypto.randomUUID()}`,
    icon: '🏋️',
    name: 'Treino feito',
    points: 100,
    requiresPhoto: true,
    dailyLimit: 1,
    rule: 'Foto do treino ou do equipamento.',
  },
  {
    id: `act-${crypto.randomUUID()}`,
    icon: '🏃',
    name: 'Cardio pago',
    points: 70,
    requiresPhoto: true,
    dailyLimit: 1,
    rule: 'Mínimo de 25 minutos contínuos.',
  },
  {
    id: `act-${crypto.randomUUID()}`,
    icon: '🥗',
    name: 'Refeição do plano',
    points: 40,
    requiresPhoto: true,
    dailyLimit: 5,
    rule: 'Refeição do WebDiet.',
  },
  {
    id: `act-${crypto.randomUUID()}`,
    icon: '💧',
    name: 'Meta de água',
    points: 30,
    requiresPhoto: false,
    dailyLimit: 1,
    rule: 'Mínimo 35 ml/kg.',
  },
  {
    id: `act-${crypto.randomUUID()}`,
    icon: '✅',
    name: 'Check-in LiveClin em dia',
    points: 150,
    requiresPhoto: false,
    dailyLimit: 1,
  },
  {
    id: `act-${crypto.randomUUID()}`,
    icon: '🔥',
    name: 'Bônus 7 dias seguidos',
    points: 200,
    requiresPhoto: false,
    dailyLimit: 1,
    rule: 'Liberado automaticamente.',
  },
]

function ActivitiesEditor({
  value,
  onChange,
}: {
  value: ChallengeActivity[]
  onChange: (next: ChallengeActivity[]) => void
}) {
  const update = (id: string, patch: Partial<ChallengeActivity>) =>
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  const move = (index: number, step: -1 | 1) => {
    const next = [...value]
    const target = index + step
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  return (
    <section aria-labelledby="activities-title">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="activities-title" className="mr-auto text-sm font-semibold">
          Atividades que pontuam
        </h3>
        {value.length === 0 && (
          <Button size="sm" variant="secondary" onClick={() => onChange(elevnActivityTemplate())}>
            Usar modelo Elevn
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            onChange([
              ...value,
              {
                id: `act-${crypto.randomUUID()}`,
                icon: '✅',
                name: '',
                points: 50,
                requiresPhoto: true,
                dailyLimit: 1,
              },
            ])
          }
        >
          <Icon name="plus" className="size-3.5" /> Atividade
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-ink-3">
          Nenhuma atividade ainda. Crie as suas ou comece pelo modelo Elevn.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {value.map((activity, index) => (
            <li key={activity.id} className="rounded-lg border border-line bg-subtle p-3">
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-[11px] font-medium text-ink-2">
                  Ícone
                  <select
                    value={activity.icon}
                    onChange={(event) => update(activity.id, { icon: event.target.value })}
                    className="mt-1 block h-9 rounded-control border border-line bg-surface px-1.5 text-base"
                  >
                    {activityIcons.map((icon) => (
                      <option key={icon}>{icon}</option>
                    ))}
                  </select>
                </label>
                <label className="min-w-[140px] flex-1 text-[11px] font-medium text-ink-2">
                  Nome
                  <input
                    required
                    value={activity.name}
                    onChange={(event) => update(activity.id, { name: event.target.value })}
                    placeholder="Ex.: Treino feito"
                    className={cx(field, 'h-9')}
                  />
                </label>
                <label className="w-20 text-[11px] font-medium text-ink-2">
                  Pontos
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={activity.points}
                    onChange={(event) =>
                      update(activity.id, { points: Number(event.target.value) })
                    }
                    className={cx(field, 'h-9 tabular-nums')}
                  />
                </label>
                <label className="w-20 text-[11px] font-medium text-ink-2">
                  Por dia
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={activity.dailyLimit}
                    onChange={(event) =>
                      update(activity.id, { dailyLimit: Number(event.target.value) })
                    }
                    className={cx(field, 'h-9 tabular-nums')}
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 text-xs text-ink-2">
                  <Switch
                    checked={activity.requiresPhoto}
                    onChange={(next) => update(activity.id, { requiresPhoto: next })}
                    label={`Foto obrigatória em ${activity.name || 'atividade'}`}
                  />
                  Foto obrigatória
                </span>
                <input
                  value={activity.rule ?? ''}
                  onChange={(event) => update(activity.id, { rule: event.target.value })}
                  placeholder="Regra (opcional), ex.: mínimo de 25 minutos"
                  aria-label={`Regra de ${activity.name || 'atividade'}`}
                  className="h-8 min-w-[160px] flex-1 rounded-control border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
                />
                <span className="flex gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label="Mover para cima"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <Icon name="chevronRight" className="size-3.5 -rotate-90" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label="Mover para baixo"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <Icon name="chevronRight" className="size-3.5 rotate-90" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-danger"
                    aria-label={`Excluir ${activity.name || 'atividade'}`}
                    onClick={() => onChange(value.filter((item) => item.id !== activity.id))}
                  >
                    <Icon name="close" className="size-3.5" />
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------ challenge */

export type ChallengeDraft = Omit<GymRatsChallenge, 'id' | 'participantsCount' | 'periodLabel'>

const toInputDate = (iso?: string) => (iso ? iso.slice(0, 10) : '')

export function ChallengeEditorSheet({
  open,
  challenge,
  presets,
  onClose,
  onSave,
}: {
  open: boolean
  challenge: GymRatsChallenge | null
  presets: { label: string; url: string }[]
  onClose: () => void
  onSave: (draft: ChallengeDraft) => void
}) {
  const [draft, setDraft] = useState<ChallengeDraft | null>(null)

  useEffect(() => {
    if (!open) return
    if (challenge) {
      const { id: _id, participantsCount: _count, periodLabel: _label, ...rest } = challenge
      setDraft({ ...rest, activities: rest.activities.map((item) => ({ ...item })) })
    } else {
      const start = new Date()
      const end = new Date(start.getTime() + 29 * 86_400_000)
      setDraft({
        title: '',
        description: '',
        coverUrl: presets[0].url,
        prizeFirst: '',
        prizeSecond: '',
        prizeThird: '',
        rules: [],
        activities: [],
        startIso: start.toISOString(),
        endIso: end.toISOString(),
      })
    }
  }, [open, challenge, presets])

  const set = (patch: Partial<ChallengeDraft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current))

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      width="w-[min(640px,100vw)]"
      title={challenge ? 'Editar desafio' : 'Novo desafio'}
      description="Aberto a todos os alunos do app. As atividades e os pontos valem só para este desafio."
      submitLabel={challenge ? 'Salvar desafio' : 'Criar desafio'}
      onSubmit={(event) => {
        event.preventDefault()
        if (!draft || !draft.title.trim() || draft.activities.length === 0) return
        onSave({ ...draft, activities: draft.activities.filter((item) => item.name.trim()) })
      }}
    >
      {draft && (
        <>
          <Label text="Nome do desafio">
            <input
              required
              value={draft.title}
              onChange={(event) => set({ title: event.target.value })}
              placeholder="Ex.: 30 dias de consistência"
              className={field}
            />
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Label text="Começa em">
              <input
                type="date"
                required
                value={toInputDate(draft.startIso)}
                onChange={(event) =>
                  set({ startIso: new Date(`${event.target.value}T00:00:00`).toISOString() })
                }
                className={field}
              />
            </Label>
            <Label text="Termina em">
              <input
                type="date"
                required
                value={toInputDate(draft.endIso)}
                onChange={(event) =>
                  set({ endIso: new Date(`${event.target.value}T23:59:00`).toISOString() })
                }
                className={field}
              />
            </Label>
          </div>
          <Label text="Descrição">
            <textarea
              rows={2}
              value={draft.description}
              onChange={(event) => set({ description: event.target.value })}
              className={cx(field, 'h-auto resize-none py-2')}
            />
          </Label>
          <CoverPicker
            value={draft.coverUrl}
            onChange={(url) => set({ coverUrl: url })}
            presets={presets}
          />

          <div className="border-t border-line pt-4">
            <ActivitiesEditor
              value={draft.activities}
              onChange={(activities) => set({ activities })}
            />
            {draft.activities.length === 0 && (
              <p className="mt-1 text-[11px] text-ink-3">
                Para salvar, o desafio precisa de pelo menos uma atividade.
              </p>
            )}
          </div>

          <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
            {(['prizeFirst', 'prizeSecond', 'prizeThird'] as const).map((key, index) => (
              <Label key={key} text={`Prêmio ${index + 1}º`}>
                <input
                  value={draft[key]}
                  onChange={(event) => set({ [key]: event.target.value })}
                  placeholder="Ex.: 1 mês grátis"
                  className={field}
                />
              </Label>
            ))}
          </div>
          <Label text="Regulamento" hint="Uma regra por linha.">
            <textarea
              rows={4}
              value={draft.rules.join('\n')}
              onChange={(event) => set({ rules: event.target.value.split('\n') })}
              className={cx(field, 'h-auto resize-none py-2')}
            />
          </Label>
        </>
      )}
    </FormSheet>
  )
}

/* ------------------------------------------------------------ video */

export type VideoDraft = Omit<PlaylistLessonVideo, 'id' | 'numberLabel' | 'publishedAt'>

export function VideoUploadSheet({
  open,
  playlists,
  defaultPlaylistId,
  presets,
  onClose,
  onSave,
}: {
  open: boolean
  playlists: StudentPlaylist[]
  defaultPlaylistId?: string
  presets: { label: string; url: string }[]
  onClose: () => void
  onSave: (playlistId: string, lesson: VideoDraft) => void
}) {
  const [playlistId, setPlaylistId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('08')
  const [cover, setCover] = useState(presets[0].url)
  const [fileName, setFileName] = useState('')
  const [ratio, setRatio] = useState<'4:3' | '16:9'>('4:3')
  const [detected, setDetected] = useState<string | null>(null)
  const [material, setMaterial] = useState('')

  useEffect(() => {
    if (!open) return
    setPlaylistId(defaultPlaylistId || playlists[0]?.id || '')
    setTitle('')
    setDescription('')
    setDuration('08')
    setCover(presets[0].url)
    setFileName('')
    setRatio('4:3')
    setDetected(null)
    setMaterial('')
  }, [open, defaultPlaylistId, playlists, presets])

  /** Reads width/height and duration from the file so the format is set automatically. */
  const onVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const value = video.videoWidth / (video.videoHeight || 1)
      const next = Math.abs(value - 16 / 9) < Math.abs(value - 4 / 3) ? '16:9' : '4:3'
      setRatio(next)
      setDetected(`${video.videoWidth} × ${video.videoHeight} · detectado ${next}`)
      if (Number.isFinite(video.duration) && video.duration > 0)
        setDuration(String(Math.max(1, Math.round(video.duration / 60))).padStart(2, '0'))
      URL.revokeObjectURL(url)
    }
    video.onerror = () => URL.revokeObjectURL(url)
    video.src = url
  }

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      title="Publicar vídeo"
      description="O vídeo pode ser 4:3 ou 16:9. A capa é sempre 4:3 para alinhar a grade no celular."
      submitLabel="Publicar no Elevn Club"
      onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim() || !playlistId) return
        onSave(playlistId, {
          title: title.trim(),
          description: description.trim() || 'Aula do Elevn Club.',
          durationMinutes: `${duration.replace(/\D/g, '').padStart(2, '0') || '08'} MIN`,
          coverUrl: cover,
          videoFileName: fileName || `aula-${ratio.replace(':', 'x')}.mp4`,
          aspectRatio: ratio,
          materialName: material || undefined,
          watchProgressPercent: 0,
          stoppedAtLabel: 'Recém-publicado',
          lastWatchedLabel: 'Publicado agora',
        })
      }}
    >
      <Label text="Playlist">
        <select
          value={playlistId}
          onChange={(event) => setPlaylistId(event.target.value)}
          className={field}
        >
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.trackCategory} · {playlist.title}
            </option>
          ))}
        </select>
      </Label>
      <Label text="Título da aula">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Como estabilizar a escápula"
          className={field}
        />
      </Label>
      <div className="rounded-lg border border-line bg-subtle p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-subtle">
            <input type="file" accept="video/*" className="sr-only" onChange={onVideo} />
            <Icon name="plus" className="size-4" /> {fileName ? 'Trocar vídeo' : 'Escolher vídeo'}
          </label>
          <span className="min-w-0 flex-1 truncate text-xs text-ink-3">
            {fileName || 'MP4 ou MOV'}
          </span>
          <Segmented
            size="sm"
            label="Formato do vídeo"
            items={[
              { id: '4:3' as const, label: '4:3' },
              { id: '16:9' as const, label: '16:9' },
            ]}
            value={ratio}
            onChange={setRatio}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div
            className={cx(
              'flex w-28 items-center justify-center rounded-md bg-black text-[10px] text-white/60',
              ratio === '16:9' ? 'aspect-video' : 'aspect-[4/3]',
            )}
          >
            {ratio}
          </div>
          <p className="text-xs text-ink-2">
            {detected ?? 'O formato é detectado ao escolher o arquivo.'}
            <br />
            {ratio === '16:9'
              ? 'No celular toca na largura total, com faixas acima e abaixo.'
              : 'Ocupa o quadro 4:3 inteiro no celular.'}
          </p>
        </div>
      </div>
      <CoverPicker value={cover} onChange={setCover} presets={presets} />
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <Label text="Duração (min)">
          <input
            inputMode="numeric"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className={field}
          />
        </Label>
        <Label
          text="Material de apoio (PDF)"
          hint={material || 'Exercícios ou resumo para o aluno baixar.'}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setMaterial(event.target.files?.[0]?.name ?? '')}
            className="mt-1 block w-full text-xs text-ink-2 file:mr-3 file:rounded-control file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
          />
        </Label>
      </div>
      <Label text="Descrição">
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Orientação que o aluno vê abaixo do vídeo"
          className={cx(field, 'h-auto resize-none py-2')}
        />
      </Label>
    </FormSheet>
  )
}

/* ------------------------------------------------------------ track */

export const trackColors = ['#6b6133', '#1f6e50', '#28518a', '#7c2530', '#485263', '#9c7a23']

export function TrackSheet({
  open,
  track,
  takenNames,
  onClose,
  onSave,
}: {
  open: boolean
  track: ClubTrack | null
  takenNames: string[]
  onClose: () => void
  onSave: (track: ClubTrack) => void
}) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [color, setColor] = useState(trackColors[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(track?.name ?? '')
    setGoal(track?.goal ?? '')
    setColor(track?.color ?? trackColors[0])
    setError('')
  }, [open, track])

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      title={track ? 'Editar trilha' : 'Nova trilha'}
      description="Trilhas agrupam playlists por objetivo do aluno (ex.: dormir melhor, ganhar massa)."
      submitLabel={track ? 'Salvar trilha' : 'Criar trilha'}
      onSubmit={(event) => {
        event.preventDefault()
        const clean = name.trim()
        if (!clean) return
        if (takenNames.some((item) => item.toLowerCase() === clean.toLowerCase())) {
          setError('Já existe uma trilha com esse nome.')
          return
        }
        onSave({
          id: track?.id ?? `track-${Date.now().toString(36)}`,
          name: clean,
          goal: goal.trim(),
          color,
        })
      }}
    >
      <Label text="Nome da trilha">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Sono e recuperação"
          className={field}
          aria-invalid={!!error}
        />
        {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
      </Label>
      <Label text="Para quem é / objetivo" hint="Aparece abaixo do nome da trilha no app.">
        <input
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="Ex.: para quem treina e não recupera bem"
          className={field}
        />
      </Label>
      <div>
        <p className="text-xs font-medium text-ink-2">Cor</p>
        <div className="mt-1.5 flex gap-2" role="radiogroup" aria-label="Cor da trilha">
          {trackColors.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={color === item}
              aria-label={item}
              onClick={() => setColor(item)}
              className={cx(
                'size-8 rounded-full ring-offset-2 ring-offset-surface',
                color === item && 'ring-2 ring-brand-light',
              )}
              style={{ background: item }}
            />
          ))}
        </div>
      </div>
    </FormSheet>
  )
}

/* ------------------------------------------------------------ check-in */

export function CheckinSheet({
  open,
  challenge,
  presets,
  onClose,
  onSave,
}: {
  open: boolean
  challenge: GymRatsChallenge | null
  presets: { label: string; url: string }[]
  onClose: () => void
  onSave: (input: {
    activity: ChallengeActivity
    title: string
    note: string
    photoUrl: string
  }) => void
}) {
  const [activityId, setActivityId] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(presets[0].url)

  useEffect(() => {
    if (!open) return
    setActivityId(challenge?.activities[0]?.id ?? '')
    setTitle('')
    setNote('')
    setPhoto(presets[0].url)
  }, [open, challenge, presets])

  const activity = challenge?.activities.find((item) => item.id === activityId)

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      title="Postar como Elevn"
      description="Post oficial no mural do desafio (ex.: lembrete, destaque da semana)."
      submitLabel="Publicar no mural"
      onSubmit={(event) => {
        event.preventDefault()
        if (!activity || !title.trim()) return
        onSave({ activity, title: title.trim(), note: note.trim(), photoUrl: photo })
      }}
    >
      {challenge && challenge.activities.length > 0 ? (
        <Label text="Atividade">
          <select
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
            className={field}
          >
            {challenge.activities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.icon} {item.name} · +{item.points} pts
              </option>
            ))}
          </select>
        </Label>
      ) : (
        <p className="text-sm text-ink-3">
          Este desafio ainda não tem atividades. Cadastre em “Editar desafio”.
        </p>
      )}
      <Label text="Título">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={field}
        />
      </Label>
      <Label text="Texto">
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={cx(field, 'h-auto resize-none py-2')}
        />
      </Label>
      {(!activity || activity.requiresPhoto) && (
        <CoverPicker value={photo} onChange={setPhoto} presets={presets} />
      )}
    </FormSheet>
  )
}

/* ------------------------------------------------------------ live event */

export type LiveEvent = {
  id: string
  title: string
  host: string
  startsAtIso: string
  link: string
}

export function LiveEventSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (event: LiveEvent) => void
}) {
  const [title, setTitle] = useState('')
  const [host, setHost] = useState('Dr. Breno Monteiro')
  const [when, setWhen] = useState('')
  const [link, setLink] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle('')
    setLink('')
    const next = new Date(Date.now() + 3 * 86_400_000)
    next.setHours(19, 0, 0, 0)
    const pad = (value: number) => String(value).padStart(2, '0')
    setWhen(`${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T19:00`)
  }, [open])

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      title="Agendar encontro ao vivo"
      description="Aparece em “Próximos encontros” no Início do app, com lembrete para os alunos."
      submitLabel="Agendar"
      onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim() || !when) return
        onSave({
          id: `live-${Date.now().toString(36)}`,
          title: title.trim(),
          host: host.trim(),
          startsAtIso: new Date(when).toISOString(),
          link: link.trim(),
        })
      }}
    >
      <Label text="Tema">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Aulão de mobilidade"
          className={field}
        />
      </Label>
      <Label text="Quem apresenta">
        <input value={host} onChange={(event) => setHost(event.target.value)} className={field} />
      </Label>
      <Label text="Data e hora">
        <input
          type="datetime-local"
          required
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          className={field}
        />
      </Label>
      <Label text="Link da transmissão" hint="Opcional. Pode ser adicionado depois.">
        <input
          type="url"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://"
          className={field}
        />
      </Label>
    </FormSheet>
  )
}
