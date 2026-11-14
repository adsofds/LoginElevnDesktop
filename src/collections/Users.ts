import type { Access, CollectionConfig } from 'payload'

const isAppUser = ({ req }: Parameters<Access>[0]) => req.user?.collection === 'users'

const ownUser: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    useSessions: false,
  },
  access: {
    create: () => false,
    delete: () => false,
    read: ownUser,
    update: ownUser,
    unlock: isAppUser,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'profession',
      type: 'select',
      required: true,
      defaultValue: 'personal-trainer',
      options: [
        { label: 'Personal Trainer', value: 'personal-trainer' },
        { label: 'Nutricionista', value: 'nutritionist' },
        { label: 'Consultor multidisciplinar', value: 'multidisciplinary' },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'dashboardLayout',
      type: 'array',
      maxRows: 20,
      fields: [
        {
          name: 'widget',
          type: 'select',
          required: true,
          options: [
            { label: 'Indicadores executivos', value: 'kpi-overview' },
            { label: 'Precisa de atenção', value: 'attention-list' },
            { label: 'Tabela de alunos', value: 'students-table' },
            { label: 'Agenda da semana', value: 'weekly-agenda' },
            { label: 'Equipe', value: 'team-overview' },
            { label: 'Alunos ativos por mês', value: 'active-students-chart' },
            { label: 'Adesão ao Check-in', value: 'adherence-chart' },
            { label: 'Renovações do mês', value: 'renewals-overview' },
            { label: 'Distribuição por objetivo', value: 'goals-chart' },
            { label: 'Resumo de alunos', value: 'students-summary' },
            { label: 'Check-ins pendentes', value: 'pending-checkins' },
            { label: 'Adesão aos treinos', value: 'workout-adherence' },
            { label: 'Adesão nutricional', value: 'nutrition-adherence' },
            { label: 'Atividade recente', value: 'recent-activity' },
            { label: 'Alertas', value: 'alerts' },
            { label: 'Evolução dos alunos', value: 'progress' },
            { label: 'Agenda', value: 'appointments' },
          ],
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: 'width',
          type: 'select',
          required: true,
          options: [
            { label: '1/3', value: '4' },
            { label: '1/2', value: '6' },
            { label: '2/3', value: '8' },
            { label: 'Completo', value: '12' },
          ],
        },
        {
          name: 'height',
          type: 'select',
          required: true,
          options: [
            { label: 'Compacto', value: 'compact' },
            { label: 'Médio', value: 'medium' },
            { label: 'Alto', value: 'tall' },
          ],
        },
        {
          name: 'visible',
          type: 'checkbox',
          defaultValue: true,
          required: true,
        },
      ],
    },
  ],
  versions: false,
}
