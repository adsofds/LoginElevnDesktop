'use client'

import { useLayoutEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'elevn-kpi-counted'
/** True only while the first batch of counters mounts in this browser session. */
let firstBatch: boolean | null = null

function shouldAnimate() {
  if (firstBatch !== null) return firstBatch
  let seen = true
  try {
    seen = window.sessionStorage.getItem(STORAGE_KEY) === '1'
    window.sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* storage unavailable: skip the animation */
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  firstBatch = !seen && !reduced
  // Every counter mounting in this same commit shares the decision; later mounts don't animate.
  window.setTimeout(() => {
    firstBatch = false
  }, 0)
  return firstBatch
}

/**
 * Counts the first number inside `value` up from zero, once per session, keeping
 * any prefix/suffix ("R$ 12.300", "87%"). Server and first paint show the final value.
 */
export function CountUp({ value, duration = 700 }: { value: string; duration?: number }) {
  const [display, setDisplay] = useState(value)
  const frame = useRef(0)

  useLayoutEffect(() => {
    const match = value.match(/\d[\d.,]*/)
    if (!match || !shouldAnimate()) {
      setDisplay(value)
      return
    }
    const raw = match[0]
    const decimals = raw.includes(',') ? raw.split(',')[1].length : 0
    const target = Number(raw.replace(/\./g, '').replace(',', '.'))
    if (!Number.isFinite(target) || target === 0) return
    const format = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: raw.includes('.') || target >= 10_000,
    })
    const pad = /^0\d/.test(raw) ? raw.length : 0
    const render = (n: number) => {
      const text = format.format(n)
      return value.replace(raw, pad ? text.padStart(pad, '0') : text)
    }
    const start = performance.now()
    setDisplay(render(0))
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(render(t === 1 ? target : target * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])

  return (
    <>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </>
  )
}
