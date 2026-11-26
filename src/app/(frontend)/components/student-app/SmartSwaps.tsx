'use client'

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { dietPlan } from '@/lib/demo-student-app'
import {
  categoryLabels,
  findFood,
  lookupBarcode,
  macrosFor,
  searchFoods,
  suggestSwaps,
  swapFor,
  unitOptions,
  type Macros,
  type ScannedProduct,
  type SwapFood,
  type SwapGoal,
  type SwapResult,
  type SwapUnit,
} from '@/lib/food-swaps'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Card, GoldButton } from './ui'

/*
 * Dieta → Trocas inteligentes. Two tools, as on the FA.team page the coach uses: swap
 * calculator (same calories, closest macros) and barcode lookup (Open Food Facts).
 */

type Tool = 'trocas' | 'escanear'

const tools: { id: Tool; label: string }[] = [
  { id: 'trocas', label: 'Trocas' },
  { id: 'escanear', label: 'Escanear' },
]

const fmt = (value: number, digits = 1) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: digits })

const inputClass =
  'h-12 w-full rounded-2xl bg-white/[0.06] px-4 text-base text-white outline-none ring-1 ring-white/10 ring-inset placeholder:text-white/35 focus:ring-[var(--app-gold)]/60'

/** Plan foods the student can start from, mapped to the closest item of the table. */
const planFoodMap: Record<string, string> = {
  'Ovos mexidos': 'ovo-inteiro-cozido',
  Ovos: 'ovo-inteiro-cozido',
  'Pão integral': 'pao-integral',
  Mamão: 'mamao-papaia',
  'Arroz integral': 'arroz-integral-cozido',
  Arroz: 'arroz-branco-cozido',
  Feijão: 'feijao-carioca-cozido',
  'Frango grelhado': 'frango-peito-grelhado',
  'Batata-doce': 'batata-doce-cozida',
  Aveia: 'aveia-em-flocos',
  Banana: 'banana-prata',
  'Iogurte natural desnatado': 'iogurte-natural-desnatado',
  'Whey protein': 'whey-protein-concentrado-media',
  'Pasta de amendoim': 'pasta-de-amendoim-integral',
  'Tilápia assada': 'tilapia-file-grelhado',
  'Leite desnatado': 'leite-desnatado',
  'Azeite de oliva': 'azeite-de-oliva-extra-virgem',
  'Peito de peru': 'peru-peito-cozido',
}

const planFoods = (() => {
  const seen = new Set<string>()
  const list: { label: string; food: SwapFood }[] = []
  for (const meal of dietPlan.meals) {
    for (const item of meal.foods) {
      const match = planFoodMap[item.name] ? findFood(planFoodMap[item.name]) : undefined
      if (match && !seen.has(match.id)) {
        seen.add(match.id)
        list.push({ label: item.name, food: match })
      }
    }
  }
  return list
})()

export function SmartSwaps() {
  const [tool, setTool] = useState<Tool>('trocas')
  return (
    <div className="px-5">
      <Card className="relative overflow-hidden p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full opacity-30 blur-2xl"
          style={{ background: 'var(--app-gold-deep)' }}
        />
        <div className="relative flex gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-gold)]/15 text-[var(--app-gold)]">
            <Icon name="swap" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">Trocas inteligentes</p>
            <p className="mt-0.5 text-[13px] leading-5 text-white/60">
              Troque um alimento por outro com macros parecidos e as mesmas calorias.
            </p>
          </div>
        </div>
      </Card>

      <div
        role="tablist"
        aria-label="Ferramentas de trocas"
        className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-white/[0.06] p-1"
      >
        {tools.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tool === item.id}
            onClick={() => setTool(item.id)}
            className={cx(
              'h-9 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors',
              tool === item.id ? 'bg-[var(--app-gold)] text-[#0d0a21]' : 'text-white/60',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 pb-2">
        {tool === 'trocas' && <SwapCalculator />}
        {tool === 'escanear' && <BarcodeLookup />}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Swap calculator                                                     */
/* ------------------------------------------------------------------ */

function StepTitle({ step, children }: { step: string; children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-white/80">
      <span className="grid size-6 place-items-center rounded-full bg-[var(--app-gold)]/15 text-[12px] text-[var(--app-gold)]">
        {step}
      </span>
      {children}
    </p>
  )
}

function FoodPicker({
  label,
  placeholder,
  value,
  onChange,
  exclude,
}: {
  label: string
  placeholder: string
  value: SwapFood | null
  onChange: (food: SwapFood | null) => void
  exclude?: string
}) {
  const [query, setQuery] = useState('')
  const listId = useId()
  const matches = useMemo(() => searchFoods(query, exclude), [query, exclude])

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--app-gold)]/10 px-4 py-3 ring-1 ring-[var(--app-gold)]/35 ring-inset">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{value.name}</p>
          <p className="text-xs text-white/55">
            {categoryLabels[value.category]} · {fmt(value.per100.kcal, 0)} kcal em 100 g
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setQuery('')
          }}
          className="h-9 shrink-0 rounded-full bg-white/[0.08] px-3 text-[13px] font-medium text-white/80"
        >
          Trocar
        </button>
      </div>
    )
  }

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('')
            if (event.key === 'Enter' && matches[0]) onChange(matches[0])
          }}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-controls={listId}
          className={cx(inputClass, 'pl-10')}
        />
      </label>
      {query.trim().length >= 2 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="mt-2 max-h-72 overflow-y-auto rounded-2xl bg-[var(--app-card-2)] ring-1 ring-white/10 ring-inset"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-[13px] text-white/50">
              Nenhum alimento encontrado. Tente outra palavra.
            </li>
          ) : (
            matches.map((item) => (
              <li key={item.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => onChange(item)}
                  className="flex w-full items-center justify-between gap-3 border-b border-[var(--app-line)] px-4 py-3 text-left last:border-b-0 active:bg-white/[0.06]"
                >
                  <span className="min-w-0 text-[14px]">{item.name}</span>
                  <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/60">
                    {categoryLabels[item.category]}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

function MacroPills({ macros, size = 'md' }: { macros: Macros; size?: 'md' | 'sm' }) {
  const items: [string, string][] = [
    ['kcal', `${fmt(macros.kcal, 0)}`],
    ['P', `${fmt(macros.p)} g`],
    ['C', `${fmt(macros.c)} g`],
    ['G', `${fmt(macros.g)} g`],
  ]
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {items.map(([label, value]) => (
        <div
          key={label}
          className={cx(
            'rounded-xl bg-white/[0.05] text-center',
            size === 'md' ? 'px-1 py-2' : 'px-1 py-1.5',
          )}
        >
          <p
            className={cx(
              'font-semibold tabular-nums',
              size === 'md' ? 'text-[15px]' : 'text-[13px]',
            )}
          >
            {value}
          </p>
          <p className="text-[10px] tracking-wide text-white/45 uppercase">
            {label === 'kcal'
              ? 'kcal'
              : label === 'P'
                ? 'Proteína'
                : label === 'C'
                  ? 'Carbo'
                  : 'Gordura'}
          </p>
        </div>
      ))}
    </div>
  )
}

function SwapCard({
  result,
  base,
  chosen,
}: {
  result: SwapResult
  base: Macros
  chosen?: boolean
}) {
  const diffKcal = result.macros.kcal - base.kcal
  const diffProt = result.macros.p - base.p
  return (
    <li
      className={cx(
        'rounded-[20px] p-4 ring-1 ring-inset',
        chosen
          ? 'bg-[var(--app-green)]/[0.07] ring-[var(--app-green)]/40'
          : 'bg-[var(--app-card)] ring-white/[0.06]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] leading-5 font-semibold">
            {chosen && (
              <span className="mr-1 text-[var(--app-green)]" aria-hidden>
                ✓
              </span>
            )}
            {result.food.name}
          </p>
          <p className="mt-0.5 text-[11px] text-white/45">
            {categoryLabels[result.food.category]} · {result.food.source}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-[22px] leading-6 font-bold text-[var(--app-gold)] tabular-nums">
            {fmt(result.grams, 0)} g
          </span>
          <span className="text-[11px] text-white/45">para trocar</span>
        </p>
      </div>
      <div className="mt-3">
        <MacroPills macros={result.macros} size="sm" />
      </div>
      <p className="mt-2.5 text-xs text-white/55">
        <span
          className={cx(
            'font-semibold',
            diffKcal <= 0.5 ? 'text-[var(--app-green)]' : 'text-[var(--app-red)]',
          )}
        >
          {diffKcal >= 0 ? '+' : '−'}
          {fmt(Math.abs(diffKcal), 0)} kcal
        </span>
        {' · '}
        <span
          className={cx(
            'font-semibold',
            diffProt >= 0 ? 'text-[var(--app-green)]' : 'text-[var(--app-red)]',
          )}
        >
          {diffProt >= 0 ? '+' : '−'}
          {fmt(Math.abs(diffProt))} g de proteína
        </span>
      </p>
    </li>
  )
}

function SwapCalculator() {
  const [food, setFood] = useState<SwapFood | null>(null)
  const [target, setTarget] = useState<SwapFood | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState<SwapUnit>('g')
  // Only "macros parecidos": same calories, closest protein, carbs and fat.
  const goal: SwapGoal = 'equivalente'
  const [calculated, setCalculated] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const unitInfo = unitOptions.find((item) => item.id === unit) ?? unitOptions[0]
  const amount = Number(quantity.replace(',', '.')) || 0
  const grams = amount * unitInfo.grams

  const results = useMemo(() => {
    if (!food || grams <= 0) return null
    const base = macrosFor(food, grams)
    const chosen = target ? swapFor(food, grams, target, goal) : null
    const others = suggestSwaps(food, grams, goal, {
      exclude: target ? [target.id] : [],
      limit: target ? 5 : 10,
    })
    return { base, chosen, others }
  }, [food, target, grams, goal])

  const clear = () => {
    setFood(null)
    setTarget(null)
    setQuantity('100')
    setUnit('g')
    setCalculated(false)
  }

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <StepTitle step="1">Alimento que você quer trocar</StepTitle>
        <FoodPicker
          label="Alimento"
          placeholder="Buscar alimento (ex.: arroz, frango)"
          value={food}
          onChange={(next) => {
            setFood(next)
            if (next && target?.id === next.id) setTarget(null)
            if (!next) setCalculated(false)
          }}
        />
        {!food && planFoods.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-white/45">Do seu plano</p>
            <div className="flex flex-wrap gap-1.5">
              {planFoods.map((item) => (
                <button
                  key={item.food.id}
                  type="button"
                  onClick={() => setFood(item.food)}
                  className="h-8 rounded-full bg-white/[0.06] px-3 text-[13px] text-white/80 active:bg-white/10"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-[1fr_1.35fr] gap-2">
          <label className="block">
            <span className="mb-1.5 block text-xs text-white/55">Quantidade</span>
            <input
              type="text"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value.replace(/[^\d.,]/g, ''))}
              className={cx(inputClass, 'tabular-nums')}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-white/55">Medida</span>
            <span className="relative block">
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value as SwapUnit)}
                className={cx(inputClass, 'appearance-none pr-9')}
              >
                {unitOptions.map((item) => (
                  <option key={item.id} value={item.id} className="bg-[#16141e]">
                    {item.label}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronRight"
                className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 rotate-90 text-white/45"
              />
            </span>
          </label>
        </div>
        {unit !== 'g' && unit !== 'ml' && amount > 0 && (
          <p className="mt-1.5 text-[11px] text-white/45">
            ≈ {fmt(grams, 0)} g (medida caseira aproximada)
          </p>
        )}
      </Card>

      <Card className="p-4">
        <StepTitle step="2">Trocar por (opcional)</StepTitle>
        <FoodPicker
          label="Alimento destino"
          placeholder="Buscar um alimento específico"
          value={target}
          onChange={setTarget}
          exclude={food?.id}
        />
        {!target && (
          <p className="mt-2 text-xs leading-5 text-white/45">
            Deixe vazio para ver sugestões de todas as categorias.
          </p>
        )}
      </Card>

      <div className="flex gap-2 pt-1">
        <GoldButton
          disabled={!food || grams <= 0}
          onClick={() => {
            setCalculated(true)
            window.setTimeout(
              () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
              60,
            )
          }}
          className="flex-1"
        >
          Calcular trocas
        </GoldButton>
        <button
          type="button"
          onClick={clear}
          className="h-[52px] shrink-0 rounded-full px-5 text-sm font-medium text-white/70 ring-1 ring-white/15 ring-inset active:bg-white/10"
        >
          Limpar
        </button>
      </div>

      <div ref={resultsRef} className="scroll-mt-4">
        {calculated && results && food ? (
          <div className="space-y-3 pt-3">
            <Card className="p-4">
              <p className="text-xs text-white/50">Você tem</p>
              <p className="mt-0.5 text-[16px] font-semibold">
                {food.name}{' '}
                <span className="text-white/55">
                  · {fmt(amount)} {unitInfo.short}
                </span>
              </p>
              <div className="mt-3">
                <MacroPills macros={results.base} />
              </div>
            </Card>

            {results.chosen && (
              <section aria-label="Troca escolhida">
                <h3 className="mt-2 mb-2 text-[13px] font-semibold text-white/70">
                  Troca escolhida
                </h3>
                <ul>
                  <SwapCard result={results.chosen} base={results.base} chosen />
                </ul>
              </section>
            )}

            <section aria-label="Trocas sugeridas">
              <h3 className="mt-2 mb-2 text-[13px] font-semibold text-white/70">
                {results.chosen ? 'Outras sugestões' : 'Trocas sugeridas'}
              </h3>
              {results.others.length === 0 ? (
                <p className="rounded-2xl bg-white/[0.04] px-4 py-3 text-[13px] text-white/55">
                  Nenhuma opção com esse filtro. Tente outro objetivo.
                </p>
              ) : (
                <ul className="space-y-2">
                  {results.others.map((result) => (
                    <SwapCard key={result.food.id} result={result} base={results.base} />
                  ))}
                </ul>
              )}
            </section>
            <p className="px-1 pt-1 text-[11px] leading-4 text-white/40">
              As quantidades mantêm as calorias da porção original. Dúvidas sobre trocas no seu
              plano, fale com a nutri.
            </p>
          </div>
        ) : (
          <p className="px-1 pt-3 text-center text-[13px] leading-5 text-white/45">
            Escolha um alimento e a quantidade para ver as trocas e os macros equivalentes.
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Barcode lookup                                                      */
/* ------------------------------------------------------------------ */

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>
}
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike

function BarcodeLookup() {
  const [code, setCode] = useState('')
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'found'; product: ScannedProduct; code: string }
    | { kind: 'missing'; code: string }
    | { kind: 'error' }
  >({ kind: 'idle' })
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [canScan, setCanScan] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setCanScan(
      typeof window !== 'undefined' &&
        'BarcodeDetector' in window &&
        !!navigator.mediaDevices?.getUserMedia,
    )
  }, [])

  const search = async (value = code) => {
    const clean = value.replace(/\D/g, '')
    if (clean.length < 8 || clean.length > 14) return
    setState({ kind: 'loading' })
    try {
      const product = await lookupBarcode(clean)
      setState(product ? { kind: 'found', product, code: clean } : { kind: 'missing', code: clean })
    } catch {
      setState({ kind: 'error' })
    }
  }

  // Camera scan where the browser has BarcodeDetector (Chrome on Android, for example).
  useEffect(() => {
    if (!scanning) return
    let stream: MediaStream | null = null
    let frame = 0
    let stopped = false
    const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector
    const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        const video = videoRef.current
        if (!video || stopped) return
        video.srcObject = stream
        await video.play()
        const tick = async () => {
          if (stopped) return
          try {
            const [hit] = await detector.detect(video)
            if (hit?.rawValue) {
              setCode(hit.rawValue)
              setScanning(false)
              search(hit.rawValue)
              return
            }
          } catch {
            /* keep trying on the next frame */
          }
          frame = window.requestAnimationFrame(tick)
        }
        frame = window.requestAnimationFrame(tick)
      } catch {
        setCameraError('Não foi possível abrir a câmera. Digite o código abaixo.')
        setScanning(false)
      }
    })()
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  const valid = code.replace(/\D/g, '').length >= 8

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <StepTitle step="1">Código de barras</StepTitle>
        <p className="mb-3 text-[13px] leading-5 text-white/55">
          Veja calorias e macros de um produto industrializado pelo código da embalagem.
        </p>
        {canScan && (
          <>
            {scanning ? (
              <div className="relative mb-3 overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  className="aspect-[4/3] w-full object-cover"
                  muted
                  playsInline
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-[var(--app-red)] shadow-[0_0_12px_var(--app-red)]"
                />
                <button
                  type="button"
                  onClick={() => setScanning(false)}
                  className="absolute top-2 right-2 h-8 rounded-full bg-black/60 px-3 text-xs font-medium"
                >
                  Fechar câmera
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCameraError('')
                  setScanning(true)
                }}
                className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.06] text-[13px] font-medium ring-1 ring-white/10 ring-inset"
              >
                <Icon name="photo" className="size-4" /> Escanear com a câmera
              </button>
            )}
          </>
        )}
        {cameraError && <p className="mb-3 text-xs text-[var(--app-red)]">{cameraError}</p>}
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            search()
          }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Código de barras</span>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 14))}
              placeholder="Ex.: 7891000315507"
              className={cx(inputClass, 'tabular-nums tracking-wide')}
            />
          </label>
          <button
            type="submit"
            disabled={!valid || state.kind === 'loading'}
            className="h-12 shrink-0 rounded-2xl bg-[var(--app-gold)] px-5 text-sm font-semibold text-[#0d0a21] disabled:opacity-40"
          >
            Buscar
          </button>
        </form>
      </Card>

      <div aria-live="polite">
        {state.kind === 'loading' && (
          <Card className="flex items-center justify-center gap-3 p-6 text-[13px] text-white/60">
            <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-[var(--app-gold)]" />
            Buscando produto…
          </Card>
        )}
        {state.kind === 'found' && <ProductCard product={state.product} />}
        {state.kind === 'missing' && (
          <Card className="p-4">
            <p className="text-[15px] font-semibold">Produto não encontrado</p>
            <p className="mt-1 text-[13px] leading-5 text-white/55">
              O código {state.code} não está na base Open Food Facts. Confira os números ou tente
              outro produto.
            </p>
          </Card>
        )}
        {state.kind === 'error' && (
          <Card className="p-4">
            <p className="text-[15px] font-semibold">Não deu para buscar agora</p>
            <p className="mt-1 text-[13px] leading-5 text-white/55">
              Verifique sua conexão e tente de novo.
            </p>
          </Card>
        )}
        {state.kind === 'idle' && (
          <Card className="p-4">
            <p className="text-xs font-semibold text-[var(--app-gold)]">Dicas</p>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-white/60">
              <li>O código tem de 8 a 13 dígitos e fica embaixo das barras, na embalagem.</li>
              <li>A base é mundial e colaborativa: alguns produtos podem não estar cadastrados.</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: ScannedProduct }) {
  const tiles: [string, string, string][] = [
    ['Calorias', fmt(product.per100.kcal, 0), 'kcal'],
    ['Proteínas', fmt(product.per100.p), 'g'],
    ['Carboidratos', fmt(product.per100.c), 'g'],
    ['Gorduras', fmt(product.per100.g), 'g'],
    ['Fibras', fmt(product.per100.fiber), 'g'],
    ['Sódio', fmt(product.per100.sodiumMg, 0), 'mg'],
  ]
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt=""
            className="size-14 shrink-0 rounded-xl bg-white object-contain"
          />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white/40">
            <Icon name="nutrition" className="size-6" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[15px] leading-5 font-semibold">{product.name}</p>
          {product.brand && <p className="text-[13px] text-white/55">{product.brand}</p>}
          <p className="mt-0.5 text-[11px] text-white/45">Porção: {product.serving}</p>
        </div>
      </div>
      <p className="mt-4 mb-2 text-[11px] tracking-wide text-white/45 uppercase">Em 100 g</p>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(([label, value, unit]) => (
          <div key={label} className="rounded-xl bg-white/[0.05] px-2 py-2.5 text-center">
            <p className="text-[11px] text-white/50">{label}</p>
            <p className="text-[17px] leading-6 font-semibold tabular-nums">{value}</p>
            <p className="text-[10px] text-white/40">{unit}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-white/40">Fonte: Open Food Facts</p>
    </Card>
  )
}
