import type { ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  internal: (
    <>
      <path d="M4 19V8.5L12 4l8 4.5V19" />
      <path d="M8 19v-6h8v6M3 20h18" />
    </>
  ),
  students: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M16 7.5a2.5 2.5 0 0 1 0 5M16.5 14c2.5.3 3.8 2 4 5" />
    </>
  ),
  nutrition: (
    <>
      <path d="M12 21c-4.5-2.8-7-6.6-7-11a5 5 0 0 1 7-4.6A5 5 0 0 1 19 10c0 4.4-2.5 8.2-7 11Z" />
      <path d="M12 5c.2-2 1.2-3.2 3-3M12 9v12" />
    </>
  ),
  /** Plate with fork and knife: the student's diet. */
  meal: (
    <>
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M3.5 3v5a1.5 1.5 0 0 0 3 0V3M5 9.5V21" />
      <path d="M20.5 3c-1.6.4-2.5 2.4-2.5 5.5V13h2.5M20.5 3v18" />
    </>
  ),
  training: (
    <>
      <path d="M6 9v6M3.5 10.5v3M18 9v6M20.5 10.5v3M6 12h12" />
      <rect x="1.5" y="8" width="2" height="8" rx="1" />
      <rect x="20.5" y="8" width="2" height="8" rx="1" />
    </>
  ),
  creation: (
    <>
      <path d="m9.5 8.5 6 3.5-6 3.5Z" />
      <rect x="3" y="4" width="18" height="16" rx="3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 20h4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronUpDown: <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />,
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
    </>
  ),
  logout: <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.1-1.6-1.1-2.7 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10.5" cy="7.5" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Z" />,
  team: (
    <>
      <circle cx="8" cy="9" r="2.6" />
      <circle cx="16" cy="9" r="2.6" />
      <path d="M3.5 18c.4-2.8 2.2-4.3 4.5-4.3s4.1 1.5 4.5 4.3M11.5 18c.4-2.8 2.2-4.3 4.5-4.3s4.1 1.5 4.5 4.3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  form: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="2" />
      <rect x="14" y="4" width="7" height="10" rx="2" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 20c.5-4 3-6 6.5-6 1.6 0 3 .4 4 1.2M18 13v6M15 16h6" />
    </>
  ),
  arrowRight: <path d="M5 12h14M14 7l5 5-5 5" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  phone: (
    <>
      <rect x="6.5" y="2.75" width="11" height="18.5" rx="2.5" />
      <path d="M10.5 18h3" />
    </>
  ),
  download: <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />,
  key: (
    <>
      <circle cx="15" cy="9" r="4.5" />
      <path d="m11.8 12.2-8.3 8.3M6.5 17.5l2 2M9 15l2 2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  photo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-8 8" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  dots: (
    <>
      <circle cx="5.5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18.5" cy="12" r="1" />
    </>
  ),
  eye: (
    <>
      <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  eyeOff: (
    <path d="m4 4 16 16M10.6 10.8a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.4 0 9 7 9 7a16 16 0 0 1-2 3M6.2 6.3C4.2 7.7 3 10 3 12c0 0 3.6 7 9 7 1 0 2-.2 2.8-.5" />
  ),
  swap: <path d="M7 7h12l-3-3M17 17H5l3 3" />,
}

export type IconName = keyof typeof paths

/** Outline icon set used by the shell and the shared components (24px grid, 1.6 stroke). */
export function Icon({
  name,
  className = 'size-[18px]',
}: {
  name: IconName | string
  className?: string
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </g>
    </svg>
  )
}
