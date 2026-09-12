import { AboutPage } from '../pages/AboutPage'
import { BookingInformationPage } from '../pages/BookingInformationPage'
import { ConfirmBookingPage } from '../pages/ConfirmBookingPage'
import { ContactPage } from '../pages/ContactPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OtpPage } from '../pages/OtpPage'
import { PaymentStatusPage } from '../pages/PaymentStatusPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { RoomDetailPage } from '../pages/RoomDetailPage'
import { RoomListingPage } from '../pages/RoomListingPage'
import { SecurePaymentPage } from '../pages/SecurePaymentPage'
import type { AppRoute } from '../types'

export const publicRoutes: AppRoute[] = [
  { key: 'home', element: (navigate) => <HomePage navigate={navigate} /> },
  { key: 'rooms', element: (navigate) => <RoomListingPage navigate={navigate} /> },
  { key: 'roomDetail', element: (navigate) => <RoomDetailPage navigate={navigate} /> },
  { key: 'booking', element: (navigate) => <BookingInformationPage navigate={navigate} /> },
  { key: 'confirm', element: (navigate) => <ConfirmBookingPage navigate={navigate} /> },
  { key: 'payment', element: (navigate) => <SecurePaymentPage navigate={navigate} /> },
  {
    key: 'success',
    element: (navigate) => <PaymentStatusPage variant="success" navigate={navigate} />,
  },
  {
    key: 'failed',
    element: (navigate) => <PaymentStatusPage variant="failed" navigate={navigate} />,
  },
  { key: 'contact', element: () => <ContactPage /> },
  { key: 'about', element: () => <AboutPage /> },
  { key: 'profile', element: (navigate) => <ProfilePage navigate={navigate} /> },
  { key: 'login', element: (navigate) => <LoginPage navigate={navigate} /> },
  { key: 'register', element: (navigate) => <RegisterPage navigate={navigate} /> },
  { key: 'forgot', element: (navigate) => <ForgotPasswordPage navigate={navigate} /> },
  { key: 'reset', element: (navigate) => <ResetPasswordPage navigate={navigate} /> },
  { key: 'otp', element: (navigate) => <OtpPage navigate={navigate} /> },
  { key: 'notFound', element: (navigate) => <NotFoundPage navigate={navigate} /> },
]
