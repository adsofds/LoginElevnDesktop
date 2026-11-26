'use client'

import { useEffect, useState, type FormEvent } from 'react'
import TeamPermissions from './settings/TeamPermissions'
import ThemeCustomizer from './settings/ThemeCustomizer'
import TwoFactorSetup from './settings/TwoFactorSetup'
import { Button } from './ui/Button'
import { Sheet } from './ui/Sheet'
import { Switch } from './ui/Switch'
import { cx } from './ui/cx'
import { Icon } from './ui/icons'
import { PasswordStrength } from './ui/PasswordStrength'

export type ThemeConfig = {
  id: string
  name: string
  subtitle: string
  accentColor: string
  accentLight: string
  sidebarBg: string
  canvasBg: string
}

export const presetThemes: ThemeConfig[] = [
  {
    id: 'elevn-classic',
    name: 'Elevn Classic (Padrão)',
    subtitle: 'Bronze Dourado & Azul Noturno Profundo',
    accentColor: '#6b6133',
    accentLight: '#c5bb83',
    sidebarBg: '#0d0a21',
    canvasBg: '#f7f5f0',
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian & Champagne',
    subtitle: 'Preto Obsidiana & Dourado Imperial',
    accentColor: '#9c7a23',
    accentLight: '#e0c167',
    sidebarBg: '#0c0d12',
    canvasBg: '#f5f4f0',
  },
  {
    id: 'emerald-club',
    name: 'Emerald Performance',
    subtitle: 'Verde Esmeralda Escuro & Areia',
    accentColor: '#1f6e50',
    accentLight: '#76c8a6',
    sidebarBg: '#091f18',
    canvasBg: '#f3f7f5',
  },
  {
    id: 'sapphire-exec',
    name: 'Royal Sapphire',
    subtitle: 'Azul Safira Executivo & Gelo Quente',
    accentColor: '#28518a',
    accentLight: '#8ab0e6',
    sidebarBg: '#0a1526',
    canvasBg: '#f3f5f8',
  },
  {
    id: 'burgundy-vip',
    name: 'Burgundy Reserve',
    subtitle: 'Vinho Intenso & Marfim Clássico',
    accentColor: '#7c2530',
    accentLight: '#d98c96',
    sidebarBg: '#1c090d',
    canvasBg: '#f8f4f4',
  },
  {
    id: 'graphite-minimal',
    name: 'Graphite Studio',
    subtitle: 'Grafite Minimalista & Cinza Puro',
    accentColor: '#485263',
    accentLight: '#a6b2c7',
    sidebarBg: '#14171f',
    canvasBg: '#f4f5f7',
  },
]

export type EmployeePermissionKey =
  | 'viewDashboard'
  | 'viewFinancials'
  | 'manageSiteForms'
  | 'manageStudents'
  | 'editWorkouts'
  | 'editNutrition'
  | 'manageInternal'
  | 'manageElevnClub'
  | 'manageSettings'

export type EmployeePermissions = Record<EmployeePermissionKey, boolean>

export type EmployeeMember = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  avatar: string
  status: 'Ativo' | 'Pausado'
  createdAt: string
  accessCode: string
  permissions: EmployeePermissions
}

export const permissionDefinitions: {
  key: EmployeePermissionKey
  title: string
  area: string
  description: string
  critical?: boolean
}[] = [
  {
    key: 'viewDashboard',
    title: 'Visualizar Dashboard Geral',
    area: 'Dashboard',
    description: 'Pode ver gráficos operacionais, agenda da semana e indicadores de adesão.',
  },
  {
    key: 'viewFinancials',
    title: 'Ver Faturamento, Receita e Renovações',
    area: 'Financeiro',
    description: 'Pode visualizar valores de planos, receita mensal e métricas financeiras.',
    critical: true,
  },
  {
    key: 'manageSiteForms',
    title: 'Acessar Formulários do Site e Leads',
    area: 'Comercial',
    description:
      'Pode acessar a planilha de formulários vindos do site e mudar a temperatura (Fechado, Quente, Morno, Frio).',
  },
  {
    key: 'manageStudents',
    title: 'Cadastrar, Editar e Excluir Alunos',
    area: 'Alunos',
    description:
      'Pode adicionar novos alunos, editar dados cadastrais, gerenciar renovações e gerar chaves de acesso ao app.',
  },
  {
    key: 'editWorkouts',
    title: 'Prescrever Treinos (MFIT) e Responder Dúvidas',
    area: 'Treino',
    description:
      'Pode criar e alterar Treino A, B e C dos alunos e responder comentários de execução enviados pelo celular.',
  },
  {
    key: 'editNutrition',
    title: 'Prescrever Dieta (WebDiet) e Avaliar Check-ins LiveClin',
    area: 'Nutrição',
    description:
      'Pode montar e ajustar cardápios, calorias, macronutrientes e analisar check-ins quinzenais.',
  },
  {
    key: 'manageInternal',
    title: 'Acessar Quadros Trello, Caixa de Entrada e Postagens',
    area: 'Interno',
    description:
      'Pode criar cartões nas áreas pessoais, responder mensagens internas e registrar entregas de conteúdo.',
  },
  {
    key: 'manageElevnClub',
    title: 'Publicar Vídeos, Playlists, Anúncios e Desafios no Elevn Club',
    area: 'Elevn Club',
    description:
      'Pode subir aulas 4:3, criar playlists, editar banners publicitários e configurar desafios da comunidade.',
  },
  {
    key: 'manageSettings',
    title: 'Alterar Configurações, Tema e Permissões de Equipe',
    area: 'Segurança',
    description:
      'Acesso administrativo total para cadastrar funcionários, mudar senhas e alterar permissões.',
    critical: true,
  },
]

export const rolePresetPermissions: Record<string, EmployeePermissions> = {
  'Nutricionista Esportiva': {
    viewDashboard: true,
    viewFinancials: false,
    manageSiteForms: false,
    manageStudents: true,
    editWorkouts: false,
    editNutrition: true,
    manageInternal: true,
    manageElevnClub: true,
    manageSettings: false,
  },
  'Treinador Assistente': {
    viewDashboard: true,
    viewFinancials: false,
    manageSiteForms: false,
    manageStudents: true,
    editWorkouts: true,
    editNutrition: false,
    manageInternal: true,
    manageElevnClub: true,
    manageSettings: false,
  },
  'Comercial & Closer (SDR)': {
    viewDashboard: true,
    viewFinancials: true,
    manageSiteForms: true,
    manageStudents: true,
    editWorkouts: false,
    editNutrition: false,
    manageInternal: true,
    manageElevnClub: false,
    manageSettings: false,
  },
  'Social Media & Conteúdo': {
    viewDashboard: false,
    viewFinancials: false,
    manageSiteForms: true,
    manageStudents: false,
    editWorkouts: false,
    editNutrition: false,
    manageInternal: true,
    manageElevnClub: true,
    manageSettings: false,
  },
  'Coordenador Geral': {
    viewDashboard: true,
    viewFinancials: true,
    manageSiteForms: true,
    manageStudents: true,
    editWorkouts: true,
    editNutrition: true,
    manageInternal: true,
    manageElevnClub: true,
    manageSettings: true,
  },
}

const employeeField =
  'mt-1 h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:outline-none'

export const initialEmployees: EmployeeMember[] = [
  {
    id: 'emp-1',
    name: 'Dra. Camila Ribeiro',
    role: 'Nutricionista Esportiva',
    email: 'camila.ribeiro@elevn.com.br',
    phone: '(85) 99812-4410',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    status: 'Ativo',
    createdAt: 'Desde Jan 2025',
    accessCode: 'ELV-NUT-8841',
    permissions: { ...rolePresetPermissions['Nutricionista Esportiva'] },
  },
  {
    id: 'emp-2',
    name: 'Prof. Rafael Costa',
    role: 'Treinador Assistente',
    email: 'rafael.costa@elevn.com.br',
    phone: '(85) 99741-2090',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    status: 'Ativo',
    createdAt: 'Desde Fev 2025',
    accessCode: 'ELV-TRN-5520',
    permissions: { ...rolePresetPermissions['Treinador Assistente'] },
  },
  {
    id: 'emp-3',
    name: 'Marina Lopes',
    role: 'Comercial & Closer (SDR)',
    email: 'marina.lopes@elevn.com.br',
    phone: '(85) 99610-3388',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    status: 'Ativo',
    createdAt: 'Desde Mar 2025',
    accessCode: 'ELV-COM-3190',
    permissions: { ...rolePresetPermissions['Comercial & Closer (SDR)'] },
  },
  {
    id: 'emp-4',
    name: 'Felipe Santos',
    role: 'Social Media & Conteúdo',
    email: 'felipe.santos@elevn.com.br',
    phone: '(85) 99124-7711',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    status: 'Ativo',
    createdAt: 'Desde Abr 2025',
    accessCode: 'ELV-MKT-9012',
    permissions: { ...rolePresetPermissions['Social Media & Conteúdo'] },
  },
]

export default function SettingsWorkspace({
  adminUser,
  activeTheme,
  onSelectTheme,
  tab,
  onTabChange,
}: {
  adminUser: { name: string; profession: string }
  activeTheme: ThemeConfig
  onSelectTheme: (theme: ThemeConfig) => void
  /** Controlled tab (from the URL). Falls back to local state when omitted. */
  tab?: 'employees' | 'theme' | 'security'
  onTabChange?: (tab: 'employees' | 'theme' | 'security') => void
}) {
  const [localTab, setLocalTab] = useState<'employees' | 'theme' | 'security'>('employees')
  const activeTab = tab ?? localTab
  const setActiveTab = (next: 'employees' | 'theme' | 'security') => {
    setLocalTab(next)
    onTabChange?.(next)
  }
  const [employees, setEmployees] = useState<EmployeeMember[]>(initialEmployees)
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployees[0].id)
  const [newEmpModalOpen, setNewEmpModalOpen] = useState(false)
  const [toastFeedback, setToastFeedback] = useState<string | null>(null)

  // Campos Novo Funcionário
  const [empName, setEmpName] = useState('')
  const [empRole, setEmpRole] = useState('Nutricionista Esportiva')
  const [empEmail, setEmpEmail] = useState('')
  const [empPhone, setEmpPhone] = useState('')
  const [empPassword, setEmpPassword] = useState('Elevn@2026!')
  const [empDraftPerms, setEmpDraftPerms] = useState<EmployeePermissions>({
    ...rolePresetPermissions['Nutricionista Esportiva'],
  })

  // Campos Alterar Senha do Admin
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [lastPasswordUpdate, setLastPasswordUpdate] = useState('12/03/2026 às 18:40')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false)
  const [sessions, setSessions] = useState([
    {
      id: 'mac',
      device: 'MacBook Pro · Chrome',
      place: 'Natal, RN',
      last: 'Ativo agora',
      current: true,
    },
    {
      id: 'iphone',
      device: 'iPhone 16 Pro · App Elevn Admin',
      place: 'Natal, RN',
      last: 'Hoje às 08:15',
      current: false,
    },
    {
      id: 'win',
      device: 'Windows · Edge',
      place: 'Fortaleza, CE',
      last: 'Ontem às 19:42',
      current: false,
    },
  ])

  const selectedEmployee =
    employees.find((item) => item.id === selectedEmpId) ?? employees[0] ?? null

  const showToast = (msg: string) => {
    setToastFeedback(msg)
  }

  useEffect(() => {
    if (!toastFeedback) return
    const timer = window.setTimeout(() => setToastFeedback(null), 5000)
    return () => window.clearTimeout(timer)
  }, [toastFeedback])

  const handleRolePresetChange = (roleName: string) => {
    setEmpRole(roleName)
    if (rolePresetPermissions[roleName]) {
      setEmpDraftPerms({ ...rolePresetPermissions[roleName] })
    }
  }

  const toggleEmployeePermission = (empId: string, permKey: EmployeePermissionKey) => {
    setEmployees((current) =>
      current.map((emp) => {
        if (emp.id !== empId) return emp
        const updatedPerms = {
          ...emp.permissions,
          [permKey]: !emp.permissions[permKey],
        }
        return {
          ...emp,
          permissions: updatedPerms,
        }
      }),
    )
    const targetEmp = employees.find((e) => e.id === empId)
    const targetPerm = permissionDefinitions.find((p) => p.key === permKey)
    if (targetEmp && targetPerm) {
      const willEnable = !targetEmp.permissions[permKey]
      showToast(
        `Permissão "${targetPerm.title}" ${
          willEnable ? 'LIBERADA' : 'BLOQUEADA'
        } para ${targetEmp.name}.`,
      )
    }
  }

  const applyQuickPresetToSelected = (
    mode: 'all' | 'readonly' | 'nutrition' | 'training' | 'commercial',
  ) => {
    if (!selectedEmployee) return
    let nextPerms: EmployeePermissions
    if (mode === 'all') {
      nextPerms = {
        viewDashboard: true,
        viewFinancials: true,
        manageSiteForms: true,
        manageStudents: true,
        editWorkouts: true,
        editNutrition: true,
        manageInternal: true,
        manageElevnClub: true,
        manageSettings: true,
      }
    } else if (mode === 'readonly') {
      nextPerms = {
        viewDashboard: true,
        viewFinancials: false,
        manageSiteForms: false,
        manageStudents: false,
        editWorkouts: false,
        editNutrition: false,
        manageInternal: true,
        manageElevnClub: false,
        manageSettings: false,
      }
    } else if (mode === 'nutrition') {
      nextPerms = { ...rolePresetPermissions['Nutricionista Esportiva'] }
    } else if (mode === 'training') {
      nextPerms = { ...rolePresetPermissions['Treinador Assistente'] }
    } else {
      nextPerms = { ...rolePresetPermissions['Comercial & Closer (SDR)'] }
    }

    setEmployees((current) =>
      current.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, permissions: nextPerms } : emp,
      ),
    )
    showToast(`Pacote de permissões atualizado para ${selectedEmployee.name}!`)
  }

  const toggleEmployeeStatus = (empId: string) => {
    setEmployees((current) =>
      current.map((emp) =>
        emp.id === empId ? { ...emp, status: emp.status === 'Ativo' ? 'Pausado' : 'Ativo' } : emp,
      ),
    )
  }

  const removeEmployee = (empId: string) => {
    const target = employees.find((e) => e.id === empId)
    setEmployees((current) => {
      const remaining = current.filter((emp) => emp.id !== empId)
      if (selectedEmpId === empId && remaining[0]) {
        setSelectedEmpId(remaining[0].id)
      }
      return remaining
    })
    if (target) {
      showToast(`Acesso de ${target.name} removido da plataforma.`)
    }
  }

  const handleCreateEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!empName.trim() || !empEmail.trim()) return

    const codeNum = Math.floor(1000 + Math.random() * 9000)
    const newMember: EmployeeMember = {
      id: `emp-${Date.now()}`,
      name: empName.trim(),
      role: empRole.trim() || 'Membro da Equipe',
      email: empEmail.trim().toLowerCase(),
      phone: empPhone.trim() || '(85) 99999-0000',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      status: 'Ativo',
      createdAt: 'Cadastrado agora',
      accessCode: `ELV-EQP-${codeNum}`,
      permissions: { ...empDraftPerms },
    }

    setEmployees((current) => [newMember, ...current])
    setSelectedEmpId(newMember.id)
    setEmpName('')
    setEmpEmail('')
    setEmpPhone('')
    setNewEmpModalOpen(false)
    showToast(
      `Funcionário "${newMember.name}" cadastrado com sucesso! Credencial ${newMember.accessCode} ativa.`,
    )
  }

  // Regras de senha do Admin
  const passRules = [
    { label: 'Mínimo de 8 caracteres', met: newPassword.length >= 8 },
    { label: 'Pelo menos 1 letra maiúscula (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'Pelo menos 1 número (0-9)', met: /[0-9]/.test(newPassword) },
    {
      label: 'Pelo menos 1 caractere especial (!@#$%&*)',
      met: /[!@#$%&*?_\-+=.]/.test(newPassword),
    },
  ]

  const handleUpdatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError(null)

    if (!currentPassword.trim()) {
      setPasswordError('Informe sua senha atual de administrador.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não coincide.')
      return
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR')
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setLastPasswordUpdate(`${dateStr} às ${timeStr}`)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast('Senha do Administrador atualizada com sucesso!')
  }

  return (
    <section className="settings-workspace">
      <h1 className="mb-6 text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-ink">
        Configurações
      </h1>

      {toastFeedback && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-night py-2 pr-2 pl-4 text-sm text-on-dark shadow-pop"
        >
          <span>{toastFeedback}</span>
          <button
            type="button"
            onClick={() => setToastFeedback(null)}
            className="rounded-full px-3 py-1 text-brand-light hover:bg-white/10"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav
          aria-label="Seções de Configurações"
          className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start"
        >
          {(
            [
              ['employees', 'Equipe e permissões', 'team'],
              ['theme', 'Aparência', 'palette'],
              ['security', 'Segurança', 'shield'],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
              className={cx(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors',
                activeTab === id
                  ? 'bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--border-default)]'
                  : 'text-ink-2 hover:bg-surface/60 hover:text-ink',
              )}
            >
              <Icon name={icon} className="size-4" />
              {label}
            </button>
          ))}
          <span
            className="flex shrink-0 items-center gap-2.5 px-3 py-2 text-sm text-ink-3"
            title="Em breve"
          >
            <Icon name="swap" className="size-4" />
            Integrações
            <span className="rounded-full border border-line px-1.5 text-[10px]">em breve</span>
          </span>
        </nav>
        <div className="min-w-0">
          {/* ABA 1: FUNCIONÁRIOS E PERMISSÕES (O QUE PODE OU NÃO FAZER) */}
          {activeTab === 'employees' && (
            <div className="settings-employees-section">
              <TeamPermissions
                employees={employees}
                selectedId={selectedEmployee?.id ?? ''}
                onSelect={setSelectedEmpId}
                onSave={(id, permissions) => {
                  setEmployees((current) =>
                    current.map((emp) => (emp.id === id ? { ...emp, permissions } : emp)),
                  )
                  const target = employees.find((emp) => emp.id === id)
                  if (target) showToast(`Permissões de ${target.name} salvas.`)
                }}
                onToggleStatus={toggleEmployeeStatus}
                onRemove={removeEmployee}
                onNewEmployee={() => setNewEmpModalOpen(true)}
                adminName={adminUser.name}
              />
            </div>
          )}

          <Sheet
            open={newEmpModalOpen}
            onClose={() => setNewEmpModalOpen(false)}
            label="Cadastrar funcionário"
            className="w-[min(560px,100vw)] bg-surface"
          >
            <form onSubmit={handleCreateEmployee} className="flex min-h-0 flex-1 flex-col">
              <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Cadastrar funcionário</h2>
                  <p className="mt-0.5 text-sm text-ink-2">
                    Ele recebe uma credencial de acesso e começa com as permissões abaixo.
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setNewEmpModalOpen(false)}
                >
                  <Icon name="close" className="size-4" />
                </Button>
              </header>
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-ink-2">Nome completo</span>
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="Ex.: Lucas Almeida"
                      required
                      autoComplete="off"
                      className={employeeField}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-ink-2">Função</span>
                    <select
                      value={empRole}
                      onChange={(e) => handleRolePresetChange(e.target.value)}
                      className={employeeField}
                    >
                      {Object.keys(rolePresetPermissions).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <span className="mt-1 block text-[11px] text-ink-3">
                      Aplica as permissões padrão da função.
                    </span>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-ink-2">WhatsApp</span>
                    <input
                      type="tel"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      placeholder="(85) 99988-7766"
                      className={employeeField}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-ink-2">E-mail de login</span>
                    <input
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="lucas@elevn.com.br"
                      required
                      autoComplete="off"
                      className={employeeField}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-ink-2">Senha provisória</span>
                    <input
                      type="text"
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      autoComplete="off"
                      className={cx(employeeField, 'font-mono')}
                    />
                    <span className="mt-1 block text-[11px] text-ink-3">
                      Será pedida a troca no primeiro acesso.
                    </span>
                  </label>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold text-ink">
                    Permissões iniciais{' '}
                    <span className="text-xs font-normal text-ink-3 tabular-nums">
                      {Object.values(empDraftPerms).filter(Boolean).length} de{' '}
                      {permissionDefinitions.length}
                    </span>
                  </legend>
                  <div className="mt-2 space-y-4">
                    {Array.from(new Set(permissionDefinitions.map((perm) => perm.area))).map(
                      (area) => (
                        <div key={area}>
                          <p className="text-xs font-semibold text-ink-3">{area}</p>
                          <ul className="mt-1 divide-y divide-line-subtle rounded-lg border border-line">
                            {permissionDefinitions
                              .filter((perm) => perm.area === area)
                              .map((perm) => (
                                <li key={perm.key} className="flex items-center gap-3 px-3 py-2.5">
                                  <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                                      {perm.title}
                                      {perm.critical && (
                                        <span className="rounded-full bg-warning-soft px-1.5 text-[10px] font-semibold text-warning">
                                          sensível
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-xs text-ink-3">{perm.description}</p>
                                  </div>
                                  <Switch
                                    checked={empDraftPerms[perm.key]}
                                    label={perm.title}
                                    onChange={(next) =>
                                      setEmpDraftPerms((curr) => ({ ...curr, [perm.key]: next }))
                                    }
                                  />
                                </li>
                              ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </fieldset>
              </div>
              <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
                <Button type="button" variant="ghost" onClick={() => setNewEmpModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!empName.trim() || !empEmail.trim()}
                >
                  Cadastrar e liberar acesso
                </Button>
              </footer>
            </form>
          </Sheet>

          {/* ABA 2: MUDAR A COR DO TEMA */}
          {activeTab === 'theme' && (
            <div className="settings-theme-section">
              <div className="settings-theme-card">
                <header className="settings-card-head">
                  <div>
                    <h2>Aparência</h2>
                    <p>
                      Escolha uma paleta pronta ou ajuste cada cor. Vale para todo o painel na hora.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="settings-outline-btn"
                    onClick={() => {
                      onSelectTheme(presetThemes[0])
                      showToast('Tema padrão Elevn Classic restaurado!')
                    }}
                  >
                    Restaurar padrão Elevn
                  </button>
                </header>

                <div className="theme-presets-grid">
                  {presetThemes.map((preset) => {
                    const isSelected = activeTheme.id === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`theme-preset-card ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          onSelectTheme(preset)
                          showToast(`Tema "${preset.name}" aplicado em todo o painel!`)
                        }}
                      >
                        <div
                          className="theme-swatch-preview"
                          style={{ background: preset.canvasBg }}
                        >
                          <span
                            className="swatch-sidebar"
                            style={{ background: preset.sidebarBg }}
                          />
                          <div className="swatch-content">
                            <span
                              className="swatch-accent-bar"
                              style={{ background: preset.accentColor }}
                            />
                            <span
                              className="swatch-accent-pill"
                              style={{ background: preset.accentLight }}
                            />
                          </div>
                        </div>
                        <div className="theme-preset-meta">
                          <div className="theme-preset-title">
                            <strong>{preset.name}</strong>
                            {isSelected && <span className="active-tag">Ativo</span>}
                          </div>
                          <small>{preset.subtitle}</small>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 border-t border-line pt-6">
                  <ThemeCustomizer theme={activeTheme} onChange={onSelectTheme} />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: ALTERAR SENHA DO ADMIN E SEGURANÇA */}
          {activeTab === 'security' && (
            <div className="settings-security-section">
              <div className="settings-security-grid">
                <form className="settings-password-card" onSubmit={handleUpdatePassword}>
                  <header className="settings-card-head">
                    <div>
                      <h2>Senha</h2>
                      <p>A senha que você usa para entrar no painel.</p>
                    </div>
                    <button
                      type="button"
                      className="settings-outline-btn"
                      onClick={() => setShowPasswords((prev) => !prev)}
                    >
                      {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
                    </button>
                  </header>

                  {passwordError && (
                    <div className="settings-error-alert" role="alert">
                      {passwordError}
                    </div>
                  )}

                  <div className="password-fields-stack">
                    <label>
                      <span>Senha atual</span>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </label>

                    <label>
                      <span>Nova senha</span>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Crie uma nova senha forte"
                        required
                      />
                    </label>

                    <label>
                      <span>Confirmar nova senha</span>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        required
                      />
                    </label>
                  </div>

                  <PasswordStrength value={newPassword} className="mt-3" />
                  {confirmPassword && (
                    <p
                      className={cx(
                        'mt-2 text-xs font-medium',
                        confirmPassword === newPassword ? 'text-success' : 'text-danger',
                      )}
                      role="status"
                    >
                      {confirmPassword === newPassword
                        ? '✓ As senhas coincidem'
                        : 'As senhas ainda não coincidem'}
                    </p>
                  )}

                  <footer className="password-card-footer">
                    <small>Última alteração de senha: {lastPasswordUpdate}</small>
                    <button type="submit" className="settings-primary-btn">
                      Salvar nova senha
                    </button>
                  </footer>
                </form>

                <aside className="space-y-5 rounded-card border border-line bg-surface p-5">
                  <section>
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold text-ink">
                          Verificação em duas etapas
                        </h3>
                        <p className="mt-0.5 text-[13px] leading-5 text-ink-2">
                          Pede um código do aplicativo autenticador ao entrar em um computador novo.
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        label="Verificação em duas etapas"
                        onChange={(next) => {
                          if (next) {
                            setTwoFactorSetupOpen(true)
                            return
                          }
                          if (
                            !window.confirm(
                              'Desativar a verificação em duas etapas? A conta fica menos protegida.',
                            )
                          )
                            return
                          setTwoFactorEnabled(false)
                          showToast('Verificação em duas etapas desativada.')
                        }}
                      />
                    </div>
                    {twoFactorSetupOpen && !twoFactorEnabled && (
                      <TwoFactorSetup
                        onCancel={() => setTwoFactorSetupOpen(false)}
                        onDone={() => {
                          setTwoFactorEnabled(true)
                          setTwoFactorSetupOpen(false)
                          showToast('Verificação em duas etapas ativada.')
                        }}
                      />
                    )}
                  </section>

                  <section className="border-t border-line pt-5">
                    <h3 className="text-[15px] font-semibold text-ink">Sessões ativas</h3>
                    <ul className="mt-2 divide-y divide-line-subtle">
                      {sessions.map((session) => (
                        <li key={session.id} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">
                              {session.device}
                            </p>
                            <p className="text-xs text-ink-3">
                              {session.place} · {session.last}
                            </p>
                          </div>
                          {session.current ? (
                            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                              Este dispositivo
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSessions((current) =>
                                  current.filter((item) => item.id !== session.id),
                                )
                                showToast(`Sessão encerrada: ${session.device}.`)
                              }}
                            >
                              Encerrar
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {sessions.length > 1 && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="mt-1 self-start"
                        onClick={() => {
                          setSessions((current) => current.filter((item) => item.current))
                          showToast('Todas as outras sessões foram encerradas.')
                        }}
                      >
                        Encerrar todas as outras sessões
                      </Button>
                    )}
                  </section>
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
