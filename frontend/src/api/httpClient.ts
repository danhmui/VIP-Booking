const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
export const authSessionStorageKey = 'vip-booking-auth-session'

export type AuthSession = {
  token: string
  apiMessage?: string
  user: {
    id: string
    email: string
    fullName: string
    phone: string | null
    role: 'admin' | 'customer'
  }
}

export function readAuthSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(authSessionStorageKey)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession
    return session?.token ? session : null
  } catch {
    window.localStorage.removeItem(authSessionStorageKey)
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session))
}

export function clearAuthSession() {
  window.localStorage.removeItem(authSessionStorageKey)
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const token = readAuthSession()?.token
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`

    try {
      const errorBody = (await response.json()) as { message?: string }
      message = errorBody.message || message
    } catch {
      // Keep the generic HTTP message if the response body is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<TResponse>
}
