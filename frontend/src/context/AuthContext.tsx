import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, loginWithApi, registerWithApi } from '../api/vipBookingApi'
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
  type AuthSession,
} from '../api/httpClient'
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from './authStore'
import { useLanguage } from './LanguageContext'

function toAuthUser(sessionUser: AuthSession['user']): AuthUser {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    fullName: sessionUser.fullName,
    phone: sessionUser.phone,
    role: sessionUser.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = readAuthSession()
    return session ? toAuthUser(session.user) : null
  })

  useEffect(() => {
    if (!readAuthSession()) {
      return
    }

    getCurrentUser()
      .then((currentUser) => setUser(toAuthUser(currentUser)))
      .catch(() => {
        clearAuthSession()
        setUser(null)
      })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      login: async (email, password) => {
        try {
          const session = await loginWithApi(email, password)
          saveAuthSession(session)
          setUser(toAuthUser(session.user))
          return { ok: true, message: session.apiMessage }
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : t('auth.signInFailed'),
          }
        }
      },
      socialLogin: async (_provider, emailOverride) => {
        const email = emailOverride?.trim() || `google-${Date.now()}@vipbooking.local`
        const password = `Oauth${Date.now()}`
        const session = await registerWithApi({
          email,
          password,
          fullName: email.split('@')[0],
        })
        saveAuthSession(session)
        const nextUser = toAuthUser(session.user)
        setUser(nextUser)
        return nextUser
      },
      register: async (email, password, fullName, phone) => {
        try {
          const session = await registerWithApi({
            email,
            password,
            fullName: fullName || email.split('@')[0],
            phone,
          })
          return { ok: true, message: session.apiMessage }
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : t('auth.registerFailed'),
          }
        }
      },
      changePassword: async () => {
        return false
      },
      logout: () => {
        clearAuthSession()
        setUser(null)
      },
    }),
    [t, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
