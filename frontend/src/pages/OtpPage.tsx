import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { requestPasswordResetOtp, verifyPasswordResetOtp } from '../api/vipBookingApi'
import { AuthShell } from '../components/layout/AuthShell'
import { useToast } from '../context/ToastContext'
import type { Navigate } from '../types'
import {
  otpFlowStorageKey,
  passwordResetCodeStorageKey,
  passwordResetEmailStorageKey,
} from './ForgotPasswordPage'

export function OtpPage({ navigate }: { navigate: Navigate }) {
  const { showToast } = useToast()
  const otpFlow = window.sessionStorage.getItem(otpFlowStorageKey)
  const resetEmail = window.sessionStorage.getItem(passwordResetEmailStorageKey) ?? ''
  const nextRoute = otpFlow === 'register' ? 'login' : 'reset'
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: 6 }, () => ''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const code = useMemo(() => digits.join(''), [digits])

  const updateDigit = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, '')

    if (numericValue.length > 1) {
      const nextDigits = Array.from({ length: 6 }, (_, nextIndex) => numericValue[nextIndex] ?? '')
      setDigits(nextDigits)
      inputRefs.current[Math.min(numericValue.length, 6) - 1]?.focus()
      return
    }

    setDigits((currentDigits) =>
      currentDigits.map((digit, digitIndex) => (digitIndex === index ? numericValue : digit)),
    )

    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!resetEmail) {
      showToast({
        title: 'Email is missing',
        message: 'Please enter your email again to verify your reset code.',
        variant: 'error',
      })
      navigate('forgot')
      return
    }

    if (code.length !== 6) {
      showToast({
        title: 'Code is incomplete',
        message: 'Please enter the six-digit verification code from your email.',
        variant: 'error',
      })
      return
    }

    setIsVerifying(true)

    try {
      const message = await verifyPasswordResetOtp({ email: resetEmail, code })
      window.sessionStorage.setItem(passwordResetCodeStorageKey, code)
      showToast({ title: 'Code verified', message, variant: 'success' })
      navigate(nextRoute)
    } catch (error) {
      showToast({
        title: 'Invalid verification code',
        message: error instanceof Error ? error.message : 'Please check the code and try again.',
        variant: 'error',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!resetEmail) {
      showToast({
        title: 'Email is missing',
        message: 'Please enter your email again to request a new code.',
        variant: 'error',
      })
      navigate('forgot')
      return
    }

    setIsResending(true)

    try {
      const message = await requestPasswordResetOtp(resetEmail)
      setDigits(Array.from({ length: 6 }, () => ''))
      window.sessionStorage.removeItem(passwordResetCodeStorageKey)
      inputRefs.current[0]?.focus()
      showToast({ title: 'Verification code sent', message, variant: 'success' })
    } catch (error) {
      showToast({
        title: 'Could not resend code',
        message: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'error',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell title="Secure Verification" subtitle="Enter the six-digit code sent to your inbox.">
      <form onSubmit={handleSubmit}>
        <div className="otp-grid">
          {digits.map((digit, index) => (
            <input
              aria-label={`Verification digit ${index + 1}`}
              inputMode="numeric"
              key={index}
              maxLength={1}
              ref={(node) => {
                inputRefs.current[index] = node
              }}
              value={digit}
              onChange={(event) => updateDigit(index, event)}
              onKeyDown={(event) => {
                if (event.key === 'Backspace' && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus()
                }
              }}
            />
          ))}
        </div>
        <button className="primary-button full-width" type="submit" disabled={isVerifying}>
          {isVerifying ? 'Verifying Code' : otpFlow === 'register' ? 'Verify Account' : 'Verify Reset Code'}
        </button>
      </form>
      <p className="auth-switch">
        Did not receive it?{' '}
        <button type="button" disabled={isResending} onClick={handleResend}>
          {isResending ? 'Resending' : 'Resend code'}
        </button>
      </p>
    </AuthShell>
  )
}
