/**
 * Elevn team members who talk to students in the app (notifications, workout, diet).
 * Avatars are the pixel-art portraits in /public/team.
 */

export type TeamMemberId = 'breno' | 'athison' | 'yasmin'

export type TeamMember = {
  id: TeamMemberId
  name: string
  firstName: string
  role: string
  avatar: string
}

export const team: TeamMember[] = [
  {
    id: 'breno',
    name: 'Breno Monteiro',
    firstName: 'Breno',
    role: 'Treinador',
    avatar: '/team/breno.png',
  },
  {
    id: 'athison',
    name: 'Athison',
    firstName: 'Athison',
    role: 'Nutricionista',
    avatar: '/team/athison.png',
  },
  {
    id: 'yasmin',
    name: 'Yasmin',
    firstName: 'Yasmin',
    role: 'Equipe Elevn',
    avatar: '/team/yasmin.png',
  },
]

export const teamMember = (id: TeamMemberId) => team.find((member) => member.id === id) ?? team[0]

/** Icon of a notification on the phone: one of the team faces or the plain Elevn logo. */
export type NotificationSenderId = TeamMemberId | 'elevn'

export type NotificationSender = {
  id: NotificationSenderId
  firstName: string
  role: string
  /** null = the Elevn logo. */
  avatar: string | null
}

export const elevnSender: NotificationSender = {
  id: 'elevn',
  firstName: 'Elevn',
  role: 'Logo da Elevn',
  avatar: null,
}

export const notificationSenders: NotificationSender[] = [elevnSender, ...team]

/** Who sent a notification: the saved icon, or a match by name for older records. */
export function senderOf(notification: {
  senderId?: NotificationSenderId
  sentBy: string
}): NotificationSender {
  if (notification.senderId === 'elevn') return elevnSender
  if (notification.senderId) return teamMember(notification.senderId)
  const first = notification.sentBy.split(' ')[0]?.toLowerCase()
  return team.find((member) => member.firstName.toLowerCase() === first) ?? elevnSender
}
