'use client'

import { useState, type FormEvent } from 'react'

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

const rolePresetPermissions: Record<string, EmployeePermissions> = {
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
}: {
  adminUser: { name: string; profession: string }
  activeTheme: ThemeConfig
  onSelectTheme: (theme: ThemeConfig) => void
}) {
  const [activeTab, setActiveTab] = useState<'employees' | 'theme' | 'security'>('employees')
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

  const selectedEmployee =
    employees.find((item) => item.id === selectedEmpId) ?? employees[0] ?? null

  const showToast = (msg: string) => {
    setToastFeedback(msg)
  }

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
        emp.id === empId
          ? { ...emp, status: emp.status === 'Ativo' ? 'Pausado' : 'Ativo' }
          : emp,
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
      <header className="settings-workspace-header">
        <div>
          <p>ADMINISTRAÇÃO, SEGURANÇA E IDENTIDADE VISUAL</p>
          <h1>Configurações</h1>
          <span>
            Gerencie sua equipe e o que cada funcionário pode fazer, personalize a cor do tema da
            consultoria e atualize sua senha de administrador.
          </span>
        </div>

        <div className="settings-header-badge">
          <small>ADMINISTRADOR MASTER</small>
          <strong>{adminUser.name}</strong>
          <span>{adminUser.profession}</span>
        </div>
      </header>

      {toastFeedback && (
        <div className="settings-toast-banner" role="status">
          <span>✓ {toastFeedback}</span>
          <button type="button" onClick={() => setToastFeedback(null)}>
            Fechar
          </button>
        </div>
      )}

      {/* ABAS DE CONFIGURAÇÕES */}
      <nav className="settings-tabs-nav" aria-label="Seções de Configurações">
        <button
          type="button"
          className={activeTab === 'employees' ? 'active' : ''}
          onClick={() => setActiveTab('employees')}
        >
          <strong>Equipe & Permissões de Funcionários</strong>
          <small>Cadastrar funcionários e definir o que podem ou não fazer</small>
        </button>
        <button
          type="button"
          className={activeTab === 'theme' ? 'active' : ''}
          onClick={() => setActiveTab('theme')}
        >
          <strong>Cor do Tema & Aparência</strong>
          <small>Mudar a paleta de cores da barra lateral, botões e fundo</small>
        </button>
        <button
          type="button"
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          <strong>Alterar Senha & Segurança</strong>
          <small>Credenciais do Admin Master e proteção da conta</small>
        </button>
      </nav>

      {/* ABA 1: FUNCIONÁRIOS E PERMISSÕES (O QUE PODE OU NÃO FAZER) */}
      {activeTab === 'employees' && (
        <div className="settings-employees-section">
          <div className="settings-emp-topbar">
            <div>
              <span>GESTÃO DE ACESSOS DA EQUIPE ({employees.length} FUNCIONÁRIOS)</span>
              <h2>Funcionários Cadastrados & Controle de Permissões</h2>
              <p>
                Selecione qualquer funcionário na lista à esquerda para liberar ou bloquear em tempo
                real o que ele pode ou não fazer dentro do painel.
              </p>
            </div>
            <button
              type="button"
              className="settings-primary-btn"
              onClick={() => setNewEmpModalOpen((prev) => !prev)}
            >
              + Cadastrar Novo Funcionário
            </button>
          </div>

          {/* FORMULÁRIO EXPANSÍVEL PARA CADASTRAR NOVO FUNCIONÁRIO */}
          {newEmpModalOpen && (
            <form className="settings-new-emp-card" onSubmit={handleCreateEmployee}>
              <header className="settings-new-emp-head">
                <div>
                  <span>NOVO MEMBRO DA EQUIPE</span>
                  <h3>Cadastrar Funcionário e Definir Permissões Iniciais</h3>
                </div>
                <button type="button" onClick={() => setNewEmpModalOpen(false)}>
                  Cancelar
                </button>
              </header>

              <div className="settings-new-emp-fields">
                <label>
                  <span>Nome completo do funcionário *</span>
                  <input
                    type="text"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Ex.: Dr. Lucas Almeida"
                    required
                  />
                </label>
                <label>
                  <span>Cargo / Função na Consultoria *</span>
                  <select
                    value={empRole}
                    onChange={(e) => handleRolePresetChange(e.target.value)}
                  >
                    <option value="Nutricionista Esportiva">Nutricionista Esportiva</option>
                    <option value="Treinador Assistente">Treinador Assistente</option>
                    <option value="Comercial & Closer (SDR)">Comercial & Closer (SDR)</option>
                    <option value="Social Media & Conteúdo">Social Media & Conteúdo</option>
                    <option value="Coordenador Geral">Coordenador Geral</option>
                  </select>
                </label>
                <label>
                  <span>E-mail de Login *</span>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="lucas.almeida@elevn.com.br"
                    required
                  />
                </label>
                <label>
                  <span>WhatsApp / Telefone</span>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="(85) 99988-7766"
                  />
                </label>
                <label>
                  <span>Senha Provisória de Acesso</span>
                  <input
                    type="text"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                  />
                </label>
              </div>

              <div className="settings-new-emp-perms-box">
                <strong>Selecione o que este funcionário poderá fazer desde o primeiro acesso:</strong>
                <div className="settings-new-emp-perms-grid">
                  {permissionDefinitions.map((perm) => (
                    <label key={perm.key} className="perm-checkbox-tile">
                      <input
                        type="checkbox"
                        checked={empDraftPerms[perm.key]}
                        onChange={(e) =>
                          setEmpDraftPerms((curr) => ({
                            ...curr,
                            [perm.key]: e.target.checked,
                          }))
                        }
                      />
                      <div>
                        <span className="area-pill">{perm.area}</span>
                        <strong>{perm.title}</strong>
                        <small>{perm.description}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <footer className="settings-new-emp-footer">
                <button type="button" className="ghost" onClick={() => setNewEmpModalOpen(false)}>
                  Fechar
                </button>
                <button type="submit" className="solid">
                  Concluir Cadastro e Liberar Acesso
                </button>
              </footer>
            </form>
          )}

          <div className="settings-employees-split">
            {/* COLUNA ESQUERDA: LISTA DE FUNCIONÁRIOS */}
            <aside className="settings-employees-list">
              {employees.map((emp) => {
                const enabledCount = Object.values(emp.permissions).filter(Boolean).length
                const totalCount = permissionDefinitions.length
                const isSelected = selectedEmployee?.id === emp.id
                return (
                  <article
                    key={emp.id}
                    className={`employee-card-item ${isSelected ? 'selected' : ''} ${
                      emp.status === 'Pausado' ? 'paused' : ''
                    }`}
                    onClick={() => setSelectedEmpId(emp.id)}
                  >
                    <img src={emp.avatar} alt={emp.name} className="emp-avatar" />
                    <div className="emp-card-body">
                      <div className="emp-card-title-row">
                        <strong>{emp.name}</strong>
                        <span className={`emp-status-pill ${emp.status.toLowerCase()}`}>
                          {emp.status}
                        </span>
                      </div>
                      <span className="emp-role-label">{emp.role}</span>
                      <small className="emp-email-label">{emp.email}</small>
                      <div className="emp-perm-meter">
                        <span>
                          {enabledCount} de {totalCount} permissões liberadas
                        </span>
                        <div className="emp-perm-bar">
                          <i style={{ width: `${(enabledCount / totalCount) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </aside>

            {/* COLUNA DIREITA: MATRIZ DO QUE O FUNCIONÁRIO PODE OU NÃO FAZER */}
            {selectedEmployee && (
              <div className="settings-employee-permissions-panel">
                <header className="emp-detail-header">
                  <div className="emp-detail-profile">
                    <img src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                    <div>
                      <div className="emp-detail-badges">
                        <span className="code-badge">CREDENCIAL: {selectedEmployee.accessCode}</span>
                        <span
                          className={`emp-status-pill ${selectedEmployee.status.toLowerCase()}`}
                        >
                          ● {selectedEmployee.status}
                        </span>
                      </div>
                      <h3>{selectedEmployee.name}</h3>
                      <p>
                        {selectedEmployee.role} · {selectedEmployee.email} ·{' '}
                        {selectedEmployee.phone}
                      </p>
                    </div>
                  </div>

                  <div className="emp-detail-actions">
                    <button
                      type="button"
                      className="emp-action-btn"
                      onClick={() => toggleEmployeeStatus(selectedEmployee.id)}
                    >
                      {selectedEmployee.status === 'Ativo'
                        ? 'Pausar Acesso'
                        : 'Reativar Acesso'}
                    </button>
                    <button
                      type="button"
                      className="emp-action-btn danger"
                      onClick={() => removeEmployee(selectedEmployee.id)}
                    >
                      Remover Funcionário
                    </button>
                  </div>
                </header>

                <div className="emp-presets-bar">
                  <span>APLICAR PERFIL RÁPIDO:</span>
                  <div className="emp-presets-buttons">
                    <button type="button" onClick={() => applyQuickPresetToSelected('nutrition')}>
                      Apenas Nutrição
                    </button>
                    <button type="button" onClick={() => applyQuickPresetToSelected('training')}>
                      Apenas Treino
                    </button>
                    <button type="button" onClick={() => applyQuickPresetToSelected('commercial')}>
                      Comercial & Leads
                    </button>
                    <button type="button" onClick={() => applyQuickPresetToSelected('readonly')}>
                      Somente Leitura
                    </button>
                    <button type="button" onClick={() => applyQuickPresetToSelected('all')}>
                      Liberar Tudo
                    </button>
                  </div>
                </div>

                <div className="emp-permissions-list">
                  {permissionDefinitions.map((perm) => {
                    const allowed = selectedEmployee.permissions[perm.key]
                    return (
                      <div
                        key={perm.key}
                        className={`emp-permission-row ${allowed ? 'is-allowed' : 'is-blocked'}`}
                      >
                        <div className="emp-perm-info">
                          <div className="emp-perm-topline">
                            <span className="area-tag">{perm.area}</span>
                            {perm.critical && (
                              <span className="critical-tag">PERMISSÃO SENSÍVEL</span>
                            )}
                            <span className={`state-badge ${allowed ? 'allowed' : 'blocked'}`}>
                              {allowed ? 'PODE FAZER' : 'NÃO PODE FAZER'}
                            </span>
                          </div>
                          <strong>{perm.title}</strong>
                          <p>{perm.description}</p>
                        </div>

                        <div className="emp-perm-switch-col">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={allowed}
                            className={`perm-toggle-btn ${allowed ? 'on' : 'off'}`}
                            onClick={() =>
                              toggleEmployeePermission(selectedEmployee.id, perm.key)
                            }
                          >
                            <span className="knob" />
                            <span className="label">
                              {allowed ? 'Permitido' : 'Bloqueado'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: MUDAR A COR DO TEMA */}
      {activeTab === 'theme' && (
        <div className="settings-theme-section">
          <div className="settings-theme-card">
            <header className="settings-card-head">
              <div>
                <span>IDENTIDADE VISUAL DO SISTEMA</span>
                <h2>Cor do Tema & Aparência da Consultoria</h2>
                <p>
                  Escolha uma das paletas executivas abaixo ou personalize livremente as cores da
                  barra lateral, dos botões de destaque e do fundo do painel. A alteração é aplicada
                  imediatamente em toda a plataforma.
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
                Restaurar Padrão Elevn
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

            <div className="theme-customizer-box">
              <h3>Personalização Livre de Cores (Seletor Hexadecimal)</h3>
              <p>
                Ajuste cada cor individualmente caso deseje combinar com uma campanha ou identidade
                própria:
              </p>

              <div className="theme-color-pickers-grid">
                <label className="color-picker-tile">
                  <span>Cor Principal de Destaque (Botões & Selos)</span>
                  <div className="picker-row">
                    <input
                      type="color"
                      value={activeTheme.accentColor}
                      onChange={(e) =>
                        onSelectTheme({
                          ...activeTheme,
                          id: 'custom',
                          name: 'Tema Personalizado',
                          accentColor: e.target.value,
                        })
                      }
                    />
                    <code>{activeTheme.accentColor.toUpperCase()}</code>
                  </div>
                </label>

                <label className="color-picker-tile">
                  <span>Cor da Barra Lateral (Menu Esquerdo)</span>
                  <div className="picker-row">
                    <input
                      type="color"
                      value={activeTheme.sidebarBg}
                      onChange={(e) =>
                        onSelectTheme({
                          ...activeTheme,
                          id: 'custom',
                          name: 'Tema Personalizado',
                          sidebarBg: e.target.value,
                        })
                      }
                    />
                    <code>{activeTheme.sidebarBg.toUpperCase()}</code>
                  </div>
                </label>

                <label className="color-picker-tile">
                  <span>Cor de Luz / Indicador Ativo na Sidebar</span>
                  <div className="picker-row">
                    <input
                      type="color"
                      value={activeTheme.accentLight}
                      onChange={(e) =>
                        onSelectTheme({
                          ...activeTheme,
                          id: 'custom',
                          name: 'Tema Personalizado',
                          accentLight: e.target.value,
                        })
                      }
                    />
                    <code>{activeTheme.accentLight.toUpperCase()}</code>
                  </div>
                </label>

                <label className="color-picker-tile">
                  <span>Cor de Fundo do Painel Principal</span>
                  <div className="picker-row">
                    <input
                      type="color"
                      value={activeTheme.canvasBg}
                      onChange={(e) =>
                        onSelectTheme({
                          ...activeTheme,
                          id: 'custom',
                          name: 'Tema Personalizado',
                          canvasBg: e.target.value,
                        })
                      }
                    />
                    <code>{activeTheme.canvasBg.toUpperCase()}</code>
                  </div>
                </label>
              </div>
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
                  <span>CREDENCIAIS DO ADMINISTRADOR</span>
                  <h2>Alterar Senha de Acesso</h2>
                  <p>
                    Atualize sua senha master utilizada para entrar no painel administrativo da
                    Elevn.
                  </p>
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
                  <span>Senha Atual do Administrador</span>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    required
                  />
                </label>

                <label>
                  <span>Nova Senha</span>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Crie uma nova senha forte"
                    required
                  />
                </label>

                <label>
                  <span>Confirmar Nova Senha</span>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                  />
                </label>
              </div>

              <div className="password-rules-box">
                <strong>Requisitos de segurança da senha:</strong>
                <ul>
                  {passRules.map((rule) => (
                    <li key={rule.label} className={rule.met ? 'met' : ''}>
                      <span>{rule.met ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="password-card-footer">
                <small>Última alteração de senha: {lastPasswordUpdate}</small>
                <button type="submit" className="settings-primary-btn">
                  Salvar Nova Senha
                </button>
              </footer>
            </form>

            <aside className="settings-security-sidecard">
              <span>PROTEÇÃO ADICIONAL DA CONTA</span>
              <h3>Segurança & Sessões Ativas</h3>

              <div className="security-toggle-box">
                <div>
                  <strong>Autenticação em Duas Etapas (2FA)</strong>
                  <p>
                    Exigir código de confirmação no WhatsApp/E-mail ao entrar em um novo computador.
                  </p>
                </div>
                <button
                  type="button"
                  className={`perm-toggle-btn ${twoFactorEnabled ? 'on' : 'off'}`}
                  onClick={() => {
                    setTwoFactorEnabled((prev) => !prev)
                    showToast(
                      !twoFactorEnabled
                        ? 'Verificação em duas etapas (2FA) ativada!'
                        : 'Verificação em duas etapas desativada.',
                    )
                  }}
                >
                  <span className="knob" />
                  <span className="label">{twoFactorEnabled ? 'Ativo' : 'Inativo'}</span>
                </button>
              </div>

              <div className="active-sessions-list">
                <strong>Dispositivos conectados agora</strong>
                <div className="session-item">
                  <div>
                    <strong>MacBook Pro · Chrome (Fortaleza, BR)</strong>
                    <small>Sessão atual · Ativo agora</small>
                  </div>
                  <span className="session-badge">Atual</span>
                </div>
                <div className="session-item">
                  <div>
                    <strong>iPhone 16 Pro · App Elevn Admin</strong>
                    <small>Último acesso hoje às 08:15</small>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('Sessão remota encerrada com segurança em outros dispositivos.')
                    }
                  >
                    Encerrar
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  )
}
