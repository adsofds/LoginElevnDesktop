'use client'

import { useState, type FormEvent } from 'react'
import type { DashboardLayoutItem } from '@/lib/dashboard'
import AdminShell from './AdminShell'

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

function PasswordRuleIcon({ met }: { met: boolean }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
      {met && (
        <path
          d="m5.7 9 2.1 2.1 4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
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

export default function LoginGateway({
  currentDate,
  initialLayout,
}: {
  currentDate: string
  initialLayout: DashboardLayoutItem[]
}) {
  const [authenticated, setAuthenticated] = useState(false)
  const [view, setView] = useState<LoginView>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessPassword, setShowAccessPassword] = useState(false)
  const [showAccessConfirmation, setShowAccessConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [accessPassword, setAccessPassword] = useState('')
  const [accessPasswordConfirmation, setAccessPasswordConfirmation] = useState('')

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
  }

  const finishDemoAccess = () => {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setAuthenticated(true)
    }, 450)
  }

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    setError('')
    if (!email.includes('@') || password.length < 6) {
      setError('Confira o e-mail e use uma senha com pelo menos 6 caracteres.')
      return
    }
    finishDemoAccess()
  }

  const submitRecovery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('recovery-email') || '').trim()
    setError('')
    if (!email.includes('@')) {
      setError('Digite um e-mail válido para continuar.')
      return
    }
    setFeedback('Link demonstrativo enviado. Nenhum e-mail real será disparado.')
  }

  const submitAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('access-email') || '').trim()
    const key = String(form.get('access-key') || '').trim()
    setError('')
    if (!email.includes('@') || key.length < 4) {
      setError('Preencha um e-mail válido e a chave de ativação.')
      return
    }
    if (!allowedPasswordPattern.test(accessPassword)) {
      setError('A senha contém um caractere especial que não está na lista permitida.')
      return
    }
    if (!passwordRules.every((rule) => rule.met)) {
      setError('Sua senha ainda não atende a todos os requisitos.')
      return
    }
    if (accessPassword !== accessPasswordConfirmation) {
      setError('As senhas não coincidem. Confira e tente novamente.')
      return
    }
    finishDemoAccess()
  }

  if (authenticated) {
    return (
      <AdminShell
        currentDate={currentDate}
        user={{ name: 'Breno Monteiro', profession: 'Personal Trainer' }}
        initialLayout={initialLayout}
        onLogout={() => {
          setAuthenticated(false)
          setView('login')
          setFeedback('')
          setError('')
        }}
      />
    )
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
          <p>SUA MELHOR VERSÃO, ALÉM</p>
          <h1>
            Not just better,
            <br />
            <em>beyond.</em>
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
                <p>BEM-VINDO DE VOLTA</p>
                <h2>Acesse sua jornada</h2>
                <span>Entre para acompanhar sua operação e continuar evoluindo.</span>
              </header>

              <form className="login-form" onSubmit={submitLogin} noValidate>
                <label>
                  <span>E-mail</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue="breno@elevn.com.br"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Senha</span>
                  <div className="login-password">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="demo2025"
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <EyeIcon hidden={!showPassword} />
                    </button>
                  </div>
                </label>

                <div className="login-options">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Lembrar de mim</span>
                  </label>
                  <button type="button" onClick={() => changeView('forgot')}>
                    Esqueci minha senha
                  </button>
                </div>

                {error && (
                  <p className="login-feedback error" role="alert">
                    {error}
                  </p>
                )}
                <button className="login-submit" type="submit" disabled={loading}>
                  <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                  {!loading && <ArrowIcon />}
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
              <form className="login-form" onSubmit={submitRecovery} noValidate>
                <label>
                  <span>E-mail</span>
                  <input
                    name="recovery-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                  />
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
              <form className="login-form" onSubmit={submitAccess} noValidate>
                <label>
                  <span>E-mail</span>
                  <input name="access-email" type="email" placeholder="seuemail@exemplo.com" />
                </label>
                <label>
                  <span>Chave de ativação</span>
                  <input name="access-key" placeholder="ELEVN-DEMO" defaultValue="ELEVN-DEMO" />
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
                      autoComplete="new-password"
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
                <div className="password-checklist" aria-label="Requisitos da senha">
                  <strong>Sua senha precisa conter:</strong>
                  <ul>
                    {passwordRules.map((rule) => (
                      <li key={rule.label} className={rule.met ? 'met' : ''}>
                        <PasswordRuleIcon met={rule.met} />
                        <span>
                          {rule.label}
                          {'detail' in rule && rule.detail && <small>{rule.detail}</small>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {error && (
                  <p className="login-feedback error" role="alert">
                    {error}
                  </p>
                )}
                <button className="login-submit" type="submit" disabled={loading}>
                  <span>{loading ? 'Ativando...' : 'Ativar e entrar'}</span>
                  {!loading && <ArrowIcon />}
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
