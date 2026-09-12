import { createContext } from 'react'

export type UserRole = 'customer' | 'admin'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  fullName: string
  phone: string | null
}

export type AuthContextValue = {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  socialLogin: (provider: 'google' | 'apple', email?: string) => Promise<AuthUser>
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => Promise<{ ok: boolean; message?: string }>
  changePassword: (currentPassword: string, nextPassword: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
