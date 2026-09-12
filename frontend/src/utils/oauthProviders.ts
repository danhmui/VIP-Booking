type OAuthProvider = 'google' | 'apple'

type SocialAccount = {
  email: string
}

export class OAuthConfigError extends Error {
  constructor(provider: OAuthProvider, message: string) {
    super(message)
    this.name = 'OAuthConfigError'
    this.message = `[${provider.toUpperCase()}] ${message}`
  }
}

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

type GoogleNamespace = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        prompt?: string
        callback: (response: GoogleTokenResponse) => void
        error_callback?: (error: { type: string }) => void
      }) => GoogleTokenClient
    }
  }
}

type AppleSignInResponse = {
  authorization?: {
    id_token?: string
  }
  user?: {
    email?: string
  }
}

declare global {
  interface Window {
    google?: GoogleNamespace
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string
          scope: string
          redirectURI: string
          usePopup: boolean
        }) => void
        signIn: () => Promise<AppleSignInResponse>
      }
    }
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.id = id
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export async function signInWithGoogleAccount(): Promise<SocialAccount> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || clientId.startsWith('REPLACE_WITH_')) {
    throw new OAuthConfigError('google', 'Missing VITE_GOOGLE_CLIENT_ID in .env')
  }

  await loadScript('https://accounts.google.com/gsi/client', 'google-identity-script')
  if (!window.google) {
    throw new Error('Google Identity Services is unavailable.')
  }

  const tokenResponse = await new Promise<GoogleTokenResponse>((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: (response) => resolve(response),
      error_callback: (error) =>
        reject(new Error(`Google sign-in popup failed (${error.type}).`)),
    })

    tokenClient.requestAccessToken({ prompt: 'select_account' })
  })

  if (!tokenResponse.access_token) {
    throw new Error(tokenResponse.error_description || tokenResponse.error || 'Google sign-in failed.')
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
    },
  })
  if (!profileResponse.ok) {
    throw new Error('Unable to fetch Google account profile.')
  }

  const profile = (await profileResponse.json()) as { email?: string }
  if (!profile.email) {
    throw new Error('Google account email is unavailable.')
  }

  return { email: profile.email }
}

let appleInitialized = false

export async function signInWithAppleAccount(): Promise<SocialAccount> {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID
  const redirectURI = import.meta.env.VITE_APPLE_REDIRECT_URI

  if (!clientId || clientId.startsWith('REPLACE_WITH_')) {
    throw new OAuthConfigError('apple', 'Missing VITE_APPLE_CLIENT_ID in .env')
  }
  if (!redirectURI) {
    throw new OAuthConfigError('apple', 'Missing VITE_APPLE_REDIRECT_URI in .env')
  }

  await loadScript(
    'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    'apple-identity-script',
  )
  if (!window.AppleID) {
    throw new Error('Apple Sign-In JS is unavailable.')
  }

  if (!appleInitialized) {
    window.AppleID.auth.init({
      clientId,
      scope: 'name email',
      redirectURI,
      usePopup: true,
    })
    appleInitialized = true
  }

  const response = await window.AppleID.auth.signIn()
  const token = response.authorization?.id_token
  const payload = token ? decodeJwtPayload(token) : null
  const emailFromToken = typeof payload?.email === 'string' ? payload.email : ''
  const subject = typeof payload?.sub === 'string' ? payload.sub : ''
  const email = response.user?.email || emailFromToken || (subject ? `${subject}@appleid.local` : '')

  if (!email) {
    throw new Error('Apple account email is unavailable.')
  }

  return { email }
}
