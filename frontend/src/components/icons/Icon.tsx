import type { IconName } from '../../types'

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'award':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="5" />
          <path d="m8.5 12.5-1 7 4.5-2.5 4.5 2.5-1-7" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'bed':
      return (
        <svg {...common}>
          <path d="M3 11V5" />
          <path d="M21 18v-6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v6" />
          <path d="M3 18h18" />
          <path d="M6 11h15" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M4 10h16" />
        </svg>
      )
    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )
    case 'close':
      return (
        <svg {...common}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      )
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="8" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="15" width="7" height="6" rx="1.5" />
        </svg>
      )
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      )
    case 'eyeOff':
      return (
        <svg {...common}>
          <path d="M3 3l18 18" />
          <path d="M10.7 6.2A10.4 10.4 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.2 3.9" />
          <path d="M6.3 8.7C3.8 10.7 2 13 2 13s3.5 6 10 6c1.2 0 2.3-.2 3.3-.5" />
          <path d="M9.9 9.9A3 3 0 0 0 14 14" />
        </svg>
      )
    case 'edit':
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      )
    case 'filter':
      return (
        <svg {...common}>
          <path d="M4 5h16" />
          <path d="M7 12h10" />
          <path d="M10 19h4" />
        </svg>
      )
    case 'home':
      return (
        <svg {...common}>
          <path d="m4 11 8-7 8 7" />
          <path d="M6 10v10h12V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )
    case 'mapPin':
      return (
        <svg {...common}>
          <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7.5 7.5 0 1 0 20.5 14.5Z" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.8v2.5a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3A18.6 18.6 0 0 1 3.7 6.5 2 2 0 0 1 5.6 4h2.5a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2L9.3 11.7a15 15 0 0 0 3 3l1.1-1.1a2 2 0 0 1 2-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case 'service':
      return (
        <svg {...common}>
          <path d="M4 18h16" />
          <path d="M6 18a6 6 0 0 1 12 0" />
          <path d="M12 4v3" />
          <path d="M8 6l1.5 2" />
          <path d="M16 6l-1.5 2" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 2 14 9l7 3-7 3-2 7-2-7-7-3 7-3Z" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.4l6.2-.9Z" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 21a6 6 0 0 1 12 0" />
          <path d="M15 17a5 5 0 0 1 6 4" />
        </svg>
      )
    case 'wifi':
      return (
        <svg {...common}>
          <path d="M5 10a11 11 0 0 1 14 0" />
          <path d="M8 14a6 6 0 0 1 8 0" />
          <path d="M12 18h.01" />
        </svg>
      )
    default:
      return null
  }
}
