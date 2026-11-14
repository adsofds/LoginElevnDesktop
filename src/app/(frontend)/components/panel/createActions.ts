import { panelHref } from './navigation'

/** Everything the "+ Novo" menu and the command palette can create, as deep links. */
export const createActions = [
  {
    id: 'aluno',
    label: 'Aluno',
    description: 'Cadastrar ou importar do MFIT/WebDiet',
    icon: 'userPlus',
    href: panelHref('/alunos', { novo: 'aluno' }),
  },
  {
    id: 'lead',
    label: 'Lead manual',
    description: 'Registrar um formulário na planilha',
    icon: 'form',
    href: panelHref('/interno', { aba: 'formulario', novo: 'lead' }),
  },
  {
    id: 'mensagem',
    label: 'Mensagem',
    description: 'Para a equipe ou um aluno',
    icon: 'mail',
    href: panelHref('/interno', { aba: 'atualizacoes', novo: 'mensagem' }),
  },
  {
    id: 'compromisso',
    label: 'Compromisso',
    description: 'Avaliação, reunião ou prazo na agenda',
    icon: 'calendar',
    href: panelHref('/interno', { aba: 'atualizacoes', novo: 'compromisso' }),
  },
  {
    id: 'cartao',
    label: 'Cartão no Trello',
    description: 'Na primeira coluna da área aberta',
    icon: 'card',
    href: panelHref('/interno', { aba: 'trello', novo: 'cartao' }),
  },
] as const

export type CreateIntent = (typeof createActions)[number]['id']
