'use client'

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'

const recoveryCodes = [
  'K7Q2-9XMA',
  'P4LD-2WZE',
  'T8VN-6RHC',
  'B3JS-5QYU',
  'M9FE-1KDP',
  'R2XT-8GLW',
  'H6CZ-4NBV',
  'W1YQ-7TMS',
]

/** Demo pattern for the authenticator QR (no real secret is generated in this mock). */
function FakeQr() {
  const cells = Array.from({ length: 21 * 21 }, (_, index) => {
    const x = index % 21
    const y = Math.floor(index / 21)
    const finder = (cx: number, cy: number) =>
      x >= cx &&
      x < cx + 7 &&
      y >= cy &&
      y < cy + 7 &&
      !(
        x > cx &&
        x < cx + 6 &&
        y > cy &&
        y < cy + 6 &&
        !(x > cx + 1 && x < cx + 5 && y > cy + 1 && y < cy + 5)
      )
    if (finder(0, 0) || finder(14, 0) || finder(0, 14)) return true
    return (x * 7 + y * 13 + x * y) % 3 === 0
  })
  return (
    <div
      aria-hidden="true"
      className="grid size-36 grid-cols-[repeat(21,1fr)] rounded-lg bg-white p-2"
    >
      {cells.map((on, index) => (
        <span key={index} className={on ? 'bg-black' : ''} />
      ))}
    </div>
  )
}

/** Ativar → QR code → 6-digit code in separate fields → recovery codes to download. */
export default function TwoFactorSetup({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<'qr' | 'code' | 'codes'>('qr')
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    setError('')
    if (clean && index < 5) refs.current[index + 1]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus()
  }

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    event.preventDefault()
    setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] ?? ''))
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const verify = () => {
    if (digits.some((digit) => !digit)) {
      setError('Digite os 6 números do aplicativo autenticador.')
      return
    }
    setStep('codes')
  }

  const download = () => {
    const blob = new Blob([`Códigos de recuperação Elevn\n\n${recoveryCodes.join('\n')}\n`], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'elevn-codigos-de-recuperacao.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-3 rounded-lg border border-line bg-subtle p-4">
      <ol className="mb-4 flex gap-2 text-xs" aria-label="Etapas">
        {(['qr', 'code', 'codes'] as const).map((item, index) => (
          <li
            key={item}
            className={cx(
              'flex items-center gap-1.5',
              step === item ? 'font-semibold text-ink' : 'text-ink-3',
            )}
          >
            <span
              className={cx(
                'grid size-5 place-items-center rounded-full text-[11px]',
                step === item ? 'bg-brand text-white' : 'bg-line',
              )}
            >
              {index + 1}
            </span>
            {['Escanear', 'Confirmar', 'Guardar códigos'][index]}
          </li>
        ))}
      </ol>

      {step === 'qr' && (
        <div className="flex flex-wrap items-center gap-4">
          <FakeQr />
          <div className="min-w-0 flex-1 text-sm text-ink-2">
            <p>Abra o Google Authenticator, 1Password ou Authy e escaneie o código.</p>
            <p className="mt-2 text-xs text-ink-3">
              Sem câmera? Use a chave{' '}
              <code className="font-mono text-ink">ELVN 4KQ2 9XMA P7LD</code>
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button size="sm" variant="accent" onClick={() => setStep('code')}>
                Já escaneei
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'code' && (
        <div>
          <p className="text-sm text-ink-2" id="otp-label">
            Digite o código de 6 números que aparece no aplicativo.
          </p>
          <div className="mt-3 flex gap-2" role="group" aria-labelledby="otp-label">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  refs.current[index] = node
                }}
                value={digit}
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                aria-label={`Dígito ${index + 1}`}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(event, index)}
                onPaste={onPaste}
                className="size-11 rounded-control border border-line bg-surface text-center text-lg font-semibold text-ink tabular-nums focus:border-brand focus:outline-none"
              />
            ))}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {error}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setStep('qr')}>
              Voltar
            </Button>
            <Button size="sm" variant="accent" onClick={verify}>
              Confirmar código
            </Button>
          </div>
        </div>
      )}

      {step === 'codes' && (
        <div>
          <p className="text-sm text-ink-2">
            Guarde estes códigos. Cada um entra uma vez, se você perder o celular.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-sm text-ink sm:grid-cols-4">
            {recoveryCodes.map((code) => (
              <li
                key={code}
                className="rounded-md border border-line bg-surface px-2 py-1 text-center"
              >
                {code}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={download}>
              Baixar códigos (.txt)
            </Button>
            <Button size="sm" variant="accent" onClick={onDone}>
              Concluir e ativar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
