import { navItems } from '../../data/navigation'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../hooks/useAuth'
import type { Navigate, RouteKey } from '../../types'
import { getRouteHref } from '../../utils/router'
import { Icon } from '../icons/Icon'

export function SiteHeader({
  currentRoute,
  isDarkMode,
  isMenuOpen,
  navigate,
  onCloseMenu,
  onToggleDarkMode,
  onToggleMenu,
}: {
  currentRoute: RouteKey
  isDarkMode: boolean
  isMenuOpen: boolean
  navigate: Navigate
  onCloseMenu: () => void
  onToggleDarkMode: () => void
  onToggleMenu: () => void
}) {
  const { isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const navLabelByRoute: Partial<Record<RouteKey, string>> = {
    home: t('nav.home'),
    rooms: t('nav.rooms'),
    contact: t('nav.contact'),
    about: t('nav.about'),
  }

  return (
    <header className="site-header">
      <a
        className="brand"
        href={getRouteHref('home')}
        aria-label={t('header.homeAria')}
        onClick={(event) => {
          event.preventDefault()
          onCloseMenu()
          navigate('home')
        }}
      >
        <span className="brand-mark">VIP</span>
        <span>VIP Booking</span>
      </a>

      <button className="icon-button mobile-menu-button" type="button" onClick={onToggleMenu}>
        <Icon name={isMenuOpen ? 'close' : 'menu'} />
      </button>

      <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label={t('header.mainNav')}>
        {navItems.map((item) => (
          <a
            className={currentRoute === item.route ? 'active' : ''}
            href={getRouteHref(item.route)}
            key={item.route}
            onClick={(event) => {
              event.preventDefault()
              onCloseMenu()
              navigate(item.route)
            }}
          >
            {navLabelByRoute[item.route] ?? item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className={`theme-toggle ${isDarkMode ? 'active' : ''}`}
          type="button"
          aria-label={isDarkMode ? t('header.switchLight') : t('header.switchDark')}
          title={isDarkMode ? t('header.darkEnabled') : t('header.enableDark')}
          onClick={onToggleDarkMode}
        >
          <Icon name={isDarkMode ? 'moon' : 'sun'} size={16} />
        </button>
        <div className="language-switch" role="group" aria-label={t('header.languageSwitch')}>
          <button
            className={language === 'en' ? 'active' : ''}
            type="button"
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            className={language === 'vi' ? 'active' : ''}
            type="button"
            onClick={() => setLanguage('vi')}
          >
            VI
          </button>
        </div>
        <button className="primary-button compact" type="button" onClick={() => navigate('rooms')}>
          {t('header.bookNow')}
        </button>
        {isAuthenticated ? (
          <button
            className="account-avatar"
            type="button"
            aria-label={t('header.openProfile')}
            onClick={() => navigate('profile')}
          >
            <Icon name="user" size={28} />
          </button>
        ) : (
          <button className="ghost-button" type="button" onClick={() => navigate('login')}>
            {t('header.login')}
          </button>
        )}
      </div>
    </header>
  )
}
