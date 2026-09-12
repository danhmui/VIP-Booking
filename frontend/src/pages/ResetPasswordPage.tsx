import { useState, type FormEvent } from 'react'
import { resetPasswordWithOtp } from '../api/vipBookingApi'
import { AuthShell } from '../components/layout/AuthShell'
import { Icon } from '../components/icons/Icon'
import { useToast } from '../context/ToastContext'
import type { Navigate } from '../types'
import {
  otpFlowStorageKey,
  passwordResetCodeStorageKey,
  passwordResetEmailStorageKey,
} from './ForgotPasswordPage'

export function ResetPasswordPage({ navigate }: { navigate: Navigate }) {
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = window.sessionStorage.getItem(passwordResetEmailStorageKey)
    const code = window.sessionStorage.getItem(passwordResetCodeStorageKey)

    if (!email || !code) {
      showToast({
        title: 'Verification is missing',
        message: 'Please request a new verification code before resetting your password.',
        variant: 'error',
      })
      navigate('forgot')
      return
    }

    if (password.length < 6) {
      const message = 'Password must be at least 6 characters.'
      showToast({ title: 'Password is too short', message, variant: 'error' })
      return
    }

    if (password !== confirmPassword) {
      const message = 'Password confirmation does not match.'
      showToast({ title: 'Password mismatch', message, variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const message = await resetPasswordWithOtp({
        email,
        code,
        newPassword: password,
      })

      window.sessionStorage.removeItem(otpFlowStorageKey)
      window.sessionStorage.removeItem(passwordResetEmailStorageKey)
      window.sessionStorage.removeItem(passwordResetCodeStorageKey)
      showToast({ title: 'Password reset', message, variant: 'success' })
      navigate('login')
    } catch (error) {
      showToast({
        title: 'Could not reset password',
        message: error instanceof Error ? error.message : 'Please check your code and try again.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your new password below to secure your account."
      maxWidthClass="w-full max-w-[500px]"
    >
      <form onSubmit={handleSubmit}>
        <label>
          New Password
          <input
            value={password}
            type="password"
            placeholder="Enter new password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm Password
          <input
            value={confirmPassword}
            type="password"
            placeholder="Re-enter new password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting Password' : 'Reset Password'}
          <Icon name="lock" size={14} />
        </button>
      </form>
    </AuthShell>
  )
}
