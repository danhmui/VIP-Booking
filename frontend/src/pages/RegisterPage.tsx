import { useState, type FormEvent } from 'react'
import { Icon } from '../components/icons/Icon'
import { AuthShell } from '../components/layout/AuthShell'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'
import type { Navigate } from '../types'

const phonePattern = /^(?:0|\+84)(?:[\s.-]?\d){9}$/

function isValidPhoneNumber(phone: string) {
  return phonePattern.test(phone)
}

export function RegisterPage({ navigate }: { navigate: Navigate }) {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const { register } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const nextPassword = String(formData.get('password') ?? '')
    const nextConfirmPassword = String(formData.get('confirmPassword') ?? '')
    const acceptedTerms = formData.get('terms') === 'on'

    if (!email || !nextPassword) {
      const message = 'Please enter email and password.'
      showToast({ title: 'Registration incomplete', message, variant: 'error' })
      return
    }

    if (nextPassword.length < 8) {
      const message = 'Password must be at least 8 characters.'
      showToast({ title: 'Password is too short', message, variant: 'error' })
      return
    }

    if (nextPassword !== nextConfirmPassword) {
      const message = 'Password confirmation does not match.'
      showToast({ title: 'Password mismatch', message, variant: 'error' })
      return
    }

    if (!acceptedTerms) {
      const message = 'Please agree to the Terms of Service and Privacy Policy.'
      showToast({ title: 'Terms are required', message, variant: 'warning' })
      return
    }

    const fullName = String(formData.get('fullName') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()

    if (!isValidPhoneNumber(phone)) {
      showToast({
        title: t('auth.invalidPhoneTitle'),
        message: t('auth.invalidPhoneMessage'),
        variant: 'error',
      })
      return
    }

    const result = await register(email, nextPassword, fullName, phone)

    if (!result.ok) {
      const message = result.message || 'Registration failed. This email may already exist.'
      showToast({ title: 'Registration failed', message, variant: 'error' })
      return
    }

    window.sessionStorage.setItem('vip-booking:register-success', email)
    if (result.message) {
      showToast({ title: 'Registration successful', message: result.message, variant: 'success' })
    }
    navigate('login')
  }

  return (
    <AuthShell title="Create Account" subtitle="Join our exclusive luxury community." maxWidthClass="w-full max-w-[460px]">
      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input defaultValue="" name="fullName" placeholder="Enter your full name" />
        </label>
        <label>
          Email address
          <input defaultValue="" name="email" type="email" placeholder="Enter your email address" />
        </label>
        <label>
          Phone number
          <input
            autoComplete="tel"
            defaultValue=""
            inputMode="tel"
            name="phone"
            placeholder="Enter your phone number"
            type="tel"
          />
        </label>
        <label>
          Password
          <div className="relative">
            <input
              value={password}
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </label>
        <label>
          Confirm password
          <input
            value={confirmPassword}
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <label className="check-row">
          <input name="terms" type="checkbox" />
          <span>
            I agree to the <button className="link-button" type="button">Terms of Service</button> and{' '}
            <button className="link-button" type="button">Privacy Policy</button>.
          </span>
        </label>
        <button className="primary-button full-width" type="submit">
          Create Account
          <Icon name="chevron" size={14} />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('login')}>
          Sign in
        </button>
      </p>
    </AuthShell>
  )
}
