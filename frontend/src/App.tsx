import { useEffect, useMemo, useState } from 'react'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { AuthProvider } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { LanguageRuntimeTranslator } from './context/LanguageRuntimeTranslator'
import { useToast } from './context/ToastContext'
import { adminRouteKeys, authRouteKeys, privateRouteKeys } from './data/routes'
import { useAppRoute } from './hooks/useHashRoute'
import { privateRoutes } from './routes/privateRoutes'
import { publicRoutes } from './routes/publicRoutes'
import { PrivateRoute, PublicRoute } from './routes/routeGuards'

const darkModeStorageKey = 'vip-booking:dark-mode'

function App() {
  const { currentRoute, navigate } = useAppRoute()
  const { showToast } = useToast()
  const { getRouteTitle, t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem(darkModeStorageKey) !== 'false',
  )

  useEffect(() => {
    document.title = getRouteTitle(currentRoute)
  }, [currentRoute, getRouteTitle])

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
    window.localStorage.setItem(darkModeStorageKey, String(isDarkMode))
  }, [isDarkMode])

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<{ isDarkMode?: boolean }>).detail

      if (typeof detail?.isDarkMode === 'boolean') {
        setIsDarkMode(detail.isDarkMode)
      }
    }

    window.addEventListener('vip-booking:theme-change', onThemeChange)
    return () => window.removeEventListener('vip-booking:theme-change', onThemeChange)
  }, [])

  const activeRoute = useMemo(() => {
    return [...publicRoutes, ...privateRoutes].find((route) => route.key === currentRoute)
  }, [currentRoute])

  const isAuthPage = authRouteKeys.includes(currentRoute)
  const isPrivatePage = privateRouteKeys.includes(currentRoute)
  const isAdminPage = adminRouteKeys.includes(currentRoute)
  const shouldShowSiteChrome = !isAdminPage
  const routeElement =
    activeRoute?.element(navigate) ??
    publicRoutes.find((route) => route.key === 'notFound')?.element(navigate)

  return (
    <AuthProvider>
      <LanguageRuntimeTranslator />
      <div
        className={`app-shell ${isAuthPage ? 'auth-mode' : ''} ${isAdminPage ? 'admin-mode' : ''}`}
        onInvalidCapture={(event) => {
          event.preventDefault()
          const field = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          const message = field.validationMessage || 'Please check this field and try again.'
          showToast({
            title: t('app.invalidInfoTitle'),
            message,
            variant: 'error',
          })
          field.focus()
        }}
      >
        {shouldShowSiteChrome && (
          <SiteHeader
            currentRoute={currentRoute}
            isDarkMode={isDarkMode}
            isMenuOpen={isMenuOpen}
            navigate={navigate}
            onCloseMenu={() => setIsMenuOpen(false)}
            onToggleDarkMode={() => setIsDarkMode((value) => !value)}
            onToggleMenu={() => setIsMenuOpen((value) => !value)}
          />
        )}

        {isPrivatePage ? (
          <PrivateRoute navigate={navigate} requireAdmin={isAdminPage}>
            {routeElement}
          </PrivateRoute>
        ) : (
          <PublicRoute>{routeElement}</PublicRoute>
        )}

        {shouldShowSiteChrome && <SiteFooter navigate={navigate} />}
      </div>
    </AuthProvider>
  )
}

export default App
