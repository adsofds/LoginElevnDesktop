'use client'

import type { ThemeConfig } from '../SettingsWorkspace'
import { cx } from '../ui/cx'

/* ---------------------------------------------------------- contrast helpers */

const toRgb = (hex: string) => {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean
  const value = Number.parseInt(full, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const toHex = (rgb: number[]) =>
  `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`

const luminance = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrastRatio = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const mix = (hex: string, target: '#000000' | '#ffffff', amount: number) => {
  const from = toRgb(hex)
  const to = toRgb(target)
  return toHex(from.map((channel, index) => channel + (to[index] - channel) * amount))
}

/** Darkens or lightens a color in small steps until every check passes. */
function adjust(
  hex: string,
  direction: '#000000' | '#ffffff',
  passes: (candidate: string) => boolean,
) {
  for (let step = 1; step <= 20; step += 1) {
    const candidate = mix(hex, direction, step * 0.05)
    if (passes(candidate)) return candidate
  }
  return hex
}

const TEXT_DARK = '#0d0a21'
const TEXT_ON_DARK = '#f3ecce'

type Field = {
  key: 'accentColor' | 'sidebarBg' | 'accentLight' | 'canvasBg'
  label: string
  hint: string
  min: number
  ratio: (theme: ThemeConfig, value: string) => number
  direction: '#000000' | '#ffffff'
}

const fields: Field[] = [
  {
    key: 'accentColor',
    label: 'Destaque',
    hint: 'Botões principais e links',
    min: 4.5,
    ratio: (theme, value) =>
      Math.min(contrastRatio('#ffffff', value), contrastRatio(value, theme.canvasBg)),
    direction: '#000000',
  },
  {
    key: 'sidebarBg',
    label: 'Barra lateral',
    hint: 'Fundo do menu',
    min: 4.5,
    ratio: (_theme, value) => contrastRatio(TEXT_ON_DARK, value),
    direction: '#000000',
  },
  {
    key: 'accentLight',
    label: 'Indicador ativo',
    hint: 'Item selecionado na barra lateral',
    min: 3,
    ratio: (theme, value) => contrastRatio(value, theme.sidebarBg),
    direction: '#ffffff',
  },
  {
    key: 'canvasBg',
    label: 'Fundo do painel',
    hint: 'Atrás de cards e tabelas',
    min: 4.5,
    ratio: (_theme, value) => contrastRatio(TEXT_DARK, value),
    direction: '#ffffff',
  },
]

const formatRatio = (ratio: number) => `${ratio.toFixed(1).replace('.', ',')}:1`

/* ---------------------------------------------------------------- preview */

function LivePreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      aria-label="Prévia do tema"
      role="img"
      className="flex h-56 overflow-hidden rounded-card border border-line text-[11px] shadow-sm"
      style={{ background: theme.canvasBg }}
    >
      <div
        className="flex w-28 shrink-0 flex-col gap-1.5 p-3"
        style={{ background: theme.sidebarBg }}
      >
        <span className="mb-2 h-2 w-12 rounded" style={{ background: theme.accentLight }} />
        {['Dashboard', 'Interno', 'Alunos', 'Club'].map((item, index) => (
          <span
            key={item}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1"
            style={{
              color: index === 2 ? theme.accentLight : 'rgb(243 236 206 / 0.7)',
              background: index === 2 ? 'rgb(255 255 255 / 0.08)' : undefined,
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: index === 2 ? theme.accentLight : 'rgb(243 236 206 / 0.4)' }}
            />
            {item}
          </span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: TEXT_DARK }}>
            Alunos
          </span>
          <span
            className="rounded-md px-2 py-1 font-semibold text-white"
            style={{ background: theme.accentColor }}
          >
            + Cadastrar
          </span>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-2.5">
          <span className="block text-[10px] text-[#6f6a76]">Alunos ativos</span>
          <span className="block text-lg leading-6 font-semibold" style={{ color: TEXT_DARK }}>
            128
          </span>
          <span className="font-medium" style={{ color: theme.accentColor }}>
            Ver carteira →
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-2.5 py-2">
          <span className="size-5 rounded-full bg-black/10" />
          <span className="flex-1 truncate" style={{ color: TEXT_DARK }}>
            Lucas Andrade
          </span>
          <span className="rounded-full bg-[#e3f5eb] px-1.5 py-0.5 font-medium text-[#197343]">
            ● Em dia
          </span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- customizer */

export default function ThemeCustomizer({
  theme,
  onChange,
}: {
  theme: ThemeConfig
  onChange: (theme: ThemeConfig) => void
}) {
  const update = (key: Field['key'], value: string) =>
    onChange({
      ...theme,
      id: 'custom',
      name: 'Tema personalizado',
      subtitle: 'Cores escolhidas pela equipe',
      [key]: value,
    })

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div>
        <h3 className="text-[15px] font-semibold text-ink">Personalizar cores</h3>
        <p className="mt-0.5 text-sm text-ink-2">
          Cada cor é conferida contra o texto que fica sobre ela (WCAG AA).
        </p>
        <ul className="mt-4 divide-y divide-line-subtle rounded-card border border-line bg-surface">
          {fields.map((field) => {
            const value = theme[field.key]
            const ratio = field.ratio(theme, value)
            const ok = ratio >= field.min
            return (
              <li key={field.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <label className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    type="color"
                    value={value}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="size-9 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{field.label}</span>
                    <span className="block text-xs text-ink-3">
                      {field.hint} · <code className="font-mono">{value.toUpperCase()}</code>
                    </span>
                  </span>
                </label>
                <span
                  className={cx(
                    'rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                    ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                  )}
                >
                  {formatRatio(ratio)} ·{' '}
                  {ok ? (field.min === 3 ? 'AA (elementos)' : 'AA') : 'ilegível'}
                </span>
                {!ok && (
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        field.key,
                        adjust(
                          value,
                          field.direction,
                          (candidate) => field.ratio(theme, candidate) >= field.min,
                        ),
                      )
                    }
                    className="text-xs font-medium text-brand hover:text-brand-hover"
                  >
                    Ajustar automaticamente
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-ink">Prévia ao vivo</h3>
        <p className="mt-0.5 mb-4 text-sm text-ink-2">Muda enquanto você escolhe.</p>
        <LivePreview theme={theme} />
      </div>
    </div>
  )
}
