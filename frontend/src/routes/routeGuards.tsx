import { useEffect, type ReactNode } from 'react'
import { Icon } from '../components/icons/Icon'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import type { Navigate } from '../types'

export function PublicRoute({ children }: { children: ReactNode }) {
  return children
}

export function PrivateRoute({
  children,
  navigate,
  requireAdmin = false,
}: {
  children: ReactNode
  navigate: Navigate
  requireAdmin?: boolean
}) {
  const { isAuthenticated, user } = useAuth()
  const isAdminAllowed = !requireAdmin || user?.role === 'admin'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  if (!isAdminAllowed) {
    return <AccessDeniedNotice navigate={navigate} />
  }

  return children
}

function AccessDeniedNotice({ navigate }: { navigate: Navigate }) {
  const { t } = useLanguage()

  return (
    <main className="access-denied-page">
      <section className="access-denied-panel">
        <span className="status-icon failed">
          <Icon name="lock" size={28} />
        </span>
        <p className="eyebrow">{t('access.adminAccess')}</p>
        <h1>{t('access.deniedTitle')}</h1>
        <p>{t('access.deniedBody')}</p>
        <div>
          <button className="primary-button" type="button" onClick={() => navigate('login')}>
            {t('access.signInAdmin')}
          </button>
          <button className="ghost-button" type="button" onClick={() => navigate('home')}>
            {t('access.goHome')}
          </button>
        </div>
      </section>
    </main>
  )
}
