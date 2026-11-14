import { defaultDashboardLayout } from '@/lib/dashboard'
import LoginGateway from './components/LoginGateway'

export default function HomePage() {
  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  }).format(new Date())

  return <LoginGateway currentDate={currentDate} initialLayout={defaultDashboardLayout} />
}
