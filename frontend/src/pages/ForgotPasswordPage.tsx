import { useState, type FormEvent } from 'react'
import { requestPasswordResetOtp } from '../api/vipBookingApi'
import { AuthShell } from '../components/layout/AuthShell'
import { Icon } from '../components/icons/Icon'
import { useToast } from '../context/ToastContext'
import type { Navigate } from '../types'

export const otpFlowStorageKey = 'vip-booking:otp-flow'
export const passwordResetEmailStorageKey = 'vip-booking:reset-email'
export const passwordResetCodeStorageKey = 'vip-booking:reset-code'

export function ForgotPasswordPage({ navigate }: { navigate: Navigate }) {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextEmail = email.trim().toLowerCase()
    if (!nextEmail) {
      showToast({
        title: 'Email is required',
        message: 'Please enter the email address linked to your account.',
        variant: 'error',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const message = await requestPasswordResetOtp(nextEmail)
      window.sessionStorage.setItem(otpFlowStorageKey, 'reset')
      window.sessionStorage.setItem(passwordResetEmailStorageKey, nextEmail)
      window.sessionStorage.removeItem(passwordResetCodeStorageKey)
      showToast({ title: 'Verification code sent', message, variant: 'success' })
      navigate('otp')
    } catch (error) {
      showToast({
        title: 'Could not send code',
        message: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Reset Your Password"
      subtitle="Enter your email address below and we'll send you instructions to safely reset your password."
      iconName="lock"
      maxWidthClass="w-full max-w-[420px]"
    >
      <form onSubmit={handleSubmit}>
        <label>
          Email Address
          <input
            autoComplete="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending Code' : 'Send Reset Code'}
          <Icon name="chevron" size={14} />
        </button>
      </form>
      <p className="auth-switch">
        Remembered your password?{' '}
        <button type="button" onClick={() => navigate('login')}>
          Log in here
        </button>
      </p>
    </AuthShell>
  )
}
