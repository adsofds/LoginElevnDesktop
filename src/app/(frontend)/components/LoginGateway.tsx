'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { readDemoSession, writeDemoSession } from './panel/PanelState'
import { PasswordStrength } from './ui/PasswordStrength'

type LoginView = 'login' | 'forgot' | 'access'

function BrandLogo({ light = false }: { light?: boolean }) {
  return (
    <img
      className="login-brand-logo"
      src={light ? '/brand/wordmark-beige.png' : '/brand/wordmark-dark.png'}
      alt="Elevn"
    />
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m14 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m4 4 16 16M10.6 10.8a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.4 0 9 7 9 7a16 16 0 0 1-2 3M6.2 6.3C4.2 7.7 3 10 3 12c0 0 3.6 7 9 7 1 0 2-.2 2.8-.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="login-spinner">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="login-field-error" role="alert">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5v5.5M12 16.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  )
}

/** Access keys look like ELVN-4821-LA: uppercase, dashes inserted while typing or pasting. */
function maskAccessKey(value: string) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
  return [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 10)].filter(Boolean).join('-')
}

function FlowLines() {
  const lines = Array.from({ length: 11 }, (_, index) => {
    const progress = index / 10
    const startX = -65 + progress * 390
    const pinchX = 680 - progress * 48
    const lowerX = 140 + progress * 118
    const endY = 918 + progress * 25
    return (
      <path
        key={index}
        d={`M ${startX} -35
          C ${startX + 8} 112, ${pinchX + 22} 12, ${pinchX} 188
          C ${pinchX - 18} 334, ${328 + progress * 30} 355, ${276 + progress * 8} 545
          C ${230 + progress * 18} 695, ${lowerX - 62} 758, ${lowerX} 858
          C ${lowerX + 94} 1008, ${598 - progress * 25} 868, 790 ${endY}`}
        style={{ animationDelay: `${index * -0.3}s` }}
      />
    )
  })

  return (
    <svg
      className="login-flow-lines"
      viewBox="0 0 760 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {lines}
    </svg>
  )
}

export default function LoginGateway() {
  const router = useRouter()
  const [view, setView] = useState<LoginView>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessPassword, setShowAccessPassword] = useState(false)
  const [showAccessConfirmation, setShowAccessConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [accessPassword, setAccessPassword] = useState('')
  const [accessPasswordConfirmation, setAccessPasswordConfirmation] = useState('')
  const [accessKey, setAccessKey] = useState('ELVN-DEMO-01')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [capsLock, setCapsLock] = useState(false)
  const [shake, setShake] = useState(false)

  const fail = (errors: Record<string, string>) => {
    setFieldErrors(errors)
    setShake(true)
    window.setTimeout(() => setShake(false), 220)
  }

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState('CapsLock'))

  const specialCharacterPattern = /[!@#$%&*?_\-+=.]/
  const allowedPasswordPattern = /^[A-Za-z0-9!@#$%&*?_\-+=.]*$/
  const passwordRules = [
    { label: '12 caracteres ou mais', met: accessPassword.length >= 12 },
    { label: '1 número', met: /[0-9]/.test(accessPassword) },
    {
      label: '1 caractere especial',
      detail: 'Permitidos: ! @ # $ % & * ? _ - + = .',
      met: specialCharacterPattern.test(accessPassword),
    },
    { label: '1 letra maiúscula', met: /[A-Z]/.test(accessPassword) },
    { label: '1 letra minúscula', met: /[a-z]/.test(accessPassword) },
  ]

  const changeView = (next: LoginView) => {
    setView(next)
    setFeedback('')
    setError('')
    setFieldErrors({})
    setCapsLock(false)
  }

  // Already signed in on this browser: go straight to the panel
  useEffect(() => {
    if (readDemoSession()) router.replace('/dashboard')
  }, [router])

  const finishDemoAccess = () => {
    setLoading(true)
    writeDemoSession(true)
    router.prefetch('/dashboard')
    window.setTimeout(() => router.push('/dashboard'), 450)
  }

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    setError('')
    const errors: Record<string, string> = {}
    if (!email.includes('@')) errors.email = 'Digite um e-mail válido, como nome@elevn.com.br.'
    if (password.length < 6) errors.password = 'A senha tem pelo menos 6 caracteres.'
    if (Object.keys(errors).length) {
      fail(errors)
      return
    }
    setFieldErrors({})
    finishDemoAccess()
  }

  const submitRecovery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('recovery-email') || '').trim()
    setError('')
    if (!email.includes('@')) {
      fail({ recovery: 'Digite um e-mail válido para continuar.' })
      return
    }
    setFieldErrors({})
    setFeedback('Link demonstrativo enviado. Nenhum e-mail real será disparado.')
  }

  const submitAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('access-email') || '').trim()
    const key = accessKey.trim()
    setError('')
    const errors: Record<string, string> = {}
    if (!email.includes('@')) errors.accessEmail = 'Digite um e-mail válido.'
    if (key.length < 4) errors.accessKey = 'Cole a chave que você recebeu da consultoria.'
    if (!allowedPasswordPattern.test(accessPassword)) {
      errors.accessPassword = 'Use só os caracteres especiais permitidos: ! @ # $ % & * ? _ - + = .'
    } else if (!passwordRules.every((rule) => rule.met)) {
      errors.accessPassword = 'A senha ainda não atende a todos os requisitos.'
    }
    if (accessPassword !== accessPasswordConfirmation) errors.confirm = 'As senhas não coincidem.'
    if (Object.keys(errors).length) {
      fail(errors)
      return
    }
    setFieldErrors({})
    finishDemoAccess()
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel" aria-label="Elevn — Treino e nutrição">
        <header>
          <BrandLogo light />
          <span>Treino + Nutrição</span>
        </header>
        <FlowLines />
        <div className="login-brand-copy">
          <p>MÉTODO ELEVN</p>
          <h1>
            Sua melhor versão,
            <br />
            <em>além.</em>
          </h1>
          <span>
            Consistência, acompanhamento e decisões melhores para transformar treino e nutrição em
            resultados reais.
          </span>
        </div>
        <footer>
          <i aria-hidden="true" />
          Acompanhamento inteligente
        </footer>
      </section>

      <section className={`login-access-panel view-${view}`}>
        <div className="login-mobile-brand">
          <BrandLogo />
        </div>

        <div className="login-card">
          {view !== 'login' && (
            <button className="login-back" type="button" onClick={() => changeView('login')}>
              <BackIcon />
              Voltar para o login
            </button>
          )}

          {view === 'login' && (
            <>
              <header className="login-card-header">
                <p>CENTRO DE COMANDO</p>
                <h2>Bem-vindo de volta, equipe Elevn</h2>
                <span>Entre para acompanhar a operação da consultoria.</span>
              </header>

              <form className={`login-form ${shake ? 'shake' : ''}`} onSubmit={submitLogin} noValidate>
                <label>
                  <span>E-mail</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue="breno@elevn.com.br"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                  />
                  {fieldErrors.email && <FieldError id="login-email-error">{fieldErrors.email}</FieldError>}
                </label>
                <div className="login-field">
                  <div className="login-label-row">
                    <label htmlFor="login-password">Senha</label>
                    <button type="button" onClick={() => changeView('forgot')}>
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="login-password">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="demo2025"
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      onKeyDown={trackCapsLock}
                      onKeyUp={trackCapsLock}
                      onBlur={() => setCapsLock(false)}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={[fieldErrors.password && 'login-password-error', capsLock && 'login-caps'].filter(Boolean).join(' ') || undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <EyeIcon hidden={!showPassword} />
                    </button>
                  </div>
                  {capsLock && (
                    <p id="login-caps" className="login-caps" role="status">
                      Caps Lock está ativado
                    </p>
                  )}
                  {fieldErrors.password && <FieldError id="login-password-error">{fieldErrors.password}</FieldError>}
                </div>

                <div className="login-options">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Lembrar de mim</span>
                  </label>
                </div>

                {error && (
                  <p className="login-feedback error" role="alert">
                    {error}
                  </p>
                )}
                <button className="login-submit" type="submit" disabled={loading} aria-busy={loading}>
                  <span>{loading ? 'Entrando…' : 'Entrar'}</span>
                  {loading ? <Spinner /> : <ArrowIcon />}
                </button>
              </form>

              <div className="login-divider">
                <span>PRIMEIRO ACESSO?</span>
              </div>
              <button
                className="login-first-access"
                type="button"
                onClick={() => changeView('access')}
              >
                <span>
                  <strong>Tenho uma chave de acesso</strong>
                  <small>Cadastre-se com o convite da sua consultoria</small>
                </span>
                <ArrowIcon />
              </button>
            </>
          )}

          {view === 'forgot' && (
            <>
              <header className="login-card-header">
                <p>RECUPERAÇÃO DE ACESSO</p>
                <h2>Vamos recuperar sua senha</h2>
                <span>Informe o e-mail usado na Elevn para receber as instruções.</span>
              </header>
              <form className={`login-form ${shake ? 'shake' : ''}`} onSubmit={submitRecovery} noValidate>
                <label>
                  <span>E-mail</span>
                  <input
                    name="recovery-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.recovery}
                    aria-describedby={fieldErrors.recovery ? 'recovery-error' : undefined}
                  />
                  {fieldErrors.recovery && <FieldError id="recovery-error">{fieldErrors.recovery}</FieldError>}
                </label>
                {error && (
                  <p className="login-feedback error" role="alert">
                    {error}
                  </p>
                )}
                {feedback && (
                  <p className="login-feedback success" role="status">
                    {feedback}
                  </p>
                )}
                <button className="login-submit" type="submit">
                  <span>Enviar instruções</span>
                  <ArrowIcon />
                </button>
              </form>
            </>
          )}

          {view === 'access' && (
            <>
              <header className="login-card-header">
                <p>PRIMEIRO ACESSO</p>
                <h2>Ative sua conta</h2>
                <span>Use a chave recebida para conhecer a experiência Elevn.</span>
              </header>
              <form className={`login-form ${shake ? 'shake' : ''}`} onSubmit={submitAccess} noValidate>
                <label>
                  <span>E-mail</span>
                  <input
                    name="access-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.accessEmail}
                    aria-describedby={fieldErrors.accessEmail ? 'access-email-error' : undefined}
                  />
                  {fieldErrors.accessEmail && <FieldError id="access-email-error">{fieldErrors.accessEmail}</FieldError>}
                </label>
                <label>
                  <span>Chave de ativação</span>
                  <input
                    name="access-key"
                    className="login-key-input"
                    placeholder="XXXX-XXXX-XX"
                    value={accessKey}
                    onChange={(event) => setAccessKey(maskAccessKey(event.target.value))}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!fieldErrors.accessKey}
                    aria-describedby={fieldErrors.accessKey ? 'access-key-error' : undefined}
                  />
                  {fieldErrors.accessKey && <FieldError id="access-key-error">{fieldErrors.accessKey}</FieldError>}
                </label>
                <label>
                  <span>Crie uma senha</span>
                  <div className="login-password">
                    <input
                      name="access-password"
                      type={showAccessPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={accessPassword}
                      onChange={(event) => setAccessPassword(event.target.value)}
                      onKeyDown={trackCapsLock}
                      onKeyUp={trackCapsLock}
                      onBlur={() => setCapsLock(false)}
                      autoComplete="new-password"
                      aria-invalid={!!fieldErrors.accessPassword}
                      aria-describedby="access-password-strength"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessPassword((current) => !current)}
                      aria-label={showAccessPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <EyeIcon hidden={!showAccessPassword} />
                    </button>
                  </div>
                </label>
                <label>
                  <span>Repita sua senha</span>
                  <div className="login-password">
                    <input
                      name="access-password-confirmation"
                      type={showAccessConfirmation ? 'text' : 'password'}
                      placeholder="Digite a senha novamente"
                      value={accessPasswordConfirmation}
                      onChange={(event) => setAccessPasswordConfirmation(event.target.value)}
                      autoComplete="new-password"
                      aria-invalid={!!fieldErrors.confirm}
                      aria-describedby={fieldErrors.confirm ? 'access-confirm-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessConfirmation((current) => !current)}
                      aria-label={
                        showAccessConfirmation ? 'Ocultar confirmação' : 'Mostrar confirmação'
                      }
                    >
                      <EyeIcon hidden={!showAccessConfirmation} />
                    </button>
                  </div>
                </label>
                {fieldErrors.confirm && <FieldError id="access-confirm-error">{fieldErrors.confirm}</FieldError>}
                {capsLock && (
                  <p className="login-caps" role="status">
                    Caps Lock está ativado
                  </p>
                )}
                <div id="access-password-strength">
                  <PasswordStrength value={accessPassword} checks={passwordRules} />
                  {fieldErrors.accessPassword && <FieldError id="access-password-error">{fieldErrors.accessPassword}</FieldError>}
                </div>
                {error && (
                  <p className="login-feedback error" role="alert">
                    {error}
                  </p>
                )}
                <button className="login-submit" type="submit" disabled={loading}>
                  <span>{loading ? 'Ativando…' : 'Ativar e entrar'}</span>
                  {loading ? <Spinner /> : <ArrowIcon />}
                </button>
              </form>
            </>
          )}
        </div>

        <footer className="login-footer">
          <span>© {new Date().getFullYear()} Elevn</span>
          <nav aria-label="Links institucionais">
            <a href="#privacidade">Privacidade</a>
            <a href="#suporte">Suporte</a>
          </nav>
        </footer>
      </section>
    </main>
  )
}
