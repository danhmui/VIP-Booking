import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { fetchBookings } from '../api/vipBookingApi'
import { Icon } from '../components/icons/Icon'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'
import type { Navigate } from '../types'
import {
  readCustomerProfiles,
  saveCustomerProfiles,
  setActiveBookingId,
} from '../utils/appStorage'

const panelClass = 'profile-panel'
const inputClass = 'profile-input'
const textareaClass = 'profile-input profile-textarea'

type ProfileSectionId = 'profile-personal' | 'profile-history' | 'profile-payment' | 'profile-security'
type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled'

type ProfileBooking = {
  id: string
  room: string
  stay: string
  amount: string
  method: string
  status: BookingStatus
}

type ProfileSettings = {
  fullName: string
  phoneNumber: string
  address: string
  city: string
  stayNotes: string
  emailUpdates: boolean
  smsAlerts: boolean
}

const profileSettingsStorageKey = 'vip-booking:profile-settings'
const defaultStayNotesByLanguage = {
  en: 'Quiet room, high floor, fast check-in preferred.',
  vi: 'Ưu tiên phòng yên tĩnh, tầng cao và nhận phòng nhanh.',
} as const

const defaultStayNotesLegacyVi = 'Æ¯u tiÃªn phÃ²ng yÃªn tÄ©nh, táº§ng cao vÃ  nháº­n phÃ²ng nhanh.'
const defaultProfileSettings: Omit<ProfileSettings, 'fullName'> = {
  phoneNumber: '+84 901 123 456',
  address: '12 Nguyen Hue',
  city: 'Ho Chi Minh City',
  stayNotes: defaultStayNotesByLanguage.en,
  emailUpdates: true,
  smsAlerts: false,
}

function toDisplayName(email: string) {
  const namePart = email.split('@')[0] || 'VIP Guest'
  return namePart
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function ProfilePage({ navigate }: { navigate: Navigate }) {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const { changePassword, logout, user } = useAuth()
  const isVi = language === 'vi'
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('profile-personal')
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const preferredPayment = window.localStorage.getItem('vip-booking:preferred-payment')
    return preferredPayment === 'vietqr' ? preferredPayment : 'vietqr'
  })
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'cancelled'
  >('all')
  const [bookingSort, setBookingSort] = useState<'latest' | 'oldest'>('latest')
  const [profileBookings, setProfileBookings] = useState<ProfileBooking[]>([])

  const copy = {
    sidebarSections: [
      { id: 'profile-personal' as const, label: isVi ? 'Thông tin cá nhân' : 'Personal Information', hint: isVi ? 'Chi tiết hồ sơ' : 'Profile details', icon: 'user' as const },
      { id: 'profile-history' as const, label: isVi ? 'Lịch sử đặt phòng' : 'Booking History', hint: isVi ? 'Dòng thời gian đặt phòng' : 'Reservation timeline', icon: 'calendar' as const },
      { id: 'profile-payment' as const, label: isVi ? 'Hóa đơn và thanh toán' : 'Invoices & Payments', hint: isVi ? 'Thanh toán và phương thức' : 'Billing and methods', icon: 'card' as const },
      { id: 'profile-security' as const, label: isVi ? 'Bảo mật' : 'Security', hint: isVi ? 'Mật khẩu và phiên đăng nhập' : 'Password and sessions', icon: 'shield' as const },
    ],
    loadBookingsTitle: isVi ? 'Không thể tải đặt phòng' : 'Could not load bookings',
    loadBookingsMessage: isVi ? 'Không thể tải danh sách đặt phòng.' : 'Could not load bookings.',
    profileUpdatedTitle: isVi ? 'Đã cập nhật hồ sơ' : 'Profile updated',
    profileUpdatedMessage: isVi ? 'Thông tin cá nhân đã được lưu thành công.' : 'Personal information has been saved successfully.',
    paymentSavedTitle: isVi ? 'Đã lưu phương thức thanh toán' : 'Payment method saved',
    paymentSavedMessage: isVi ? 'Phương thức thanh toán ưu tiên đã được cập nhật.' : 'Preferred payment method updated successfully.',
    noPendingBookingTitle: isVi ? 'Không có đặt phòng chờ thanh toán' : 'No pending booking',
    noPendingBookingMessage: isVi ? 'Không tìm thấy đặt phòng chờ thanh toán. Vui lòng tạo đặt phòng trước.' : 'No pending booking found. Please create a booking first.',
    passwordIncompleteTitle: isVi ? 'Thiếu thông tin mật khẩu' : 'Password form incomplete',
    passwordIncompleteMessage: isVi ? 'Vui lòng điền đầy đủ các trường bắt buộc.' : 'Please complete all required fields.',
    passwordMismatchTitle: isVi ? 'Mật khẩu không khớp' : 'Password mismatch',
    passwordMismatchMessage: isVi ? 'Xác nhận mật khẩu không khớp.' : 'Password confirmation does not match.',
    passwordFailedTitle: isVi ? 'Đổi mật khẩu thất bại' : 'Password update failed',
    passwordFailedMessage: isVi ? 'Mật khẩu hiện tại không chính xác.' : 'Current password is incorrect.',
    passwordUpdatedTitle: isVi ? 'Đã cập nhật mật khẩu' : 'Password updated',
    passwordUpdatedMessage: isVi ? 'Mật khẩu đã được cập nhật thành công.' : 'Password updated successfully.',
    personalTitle: isVi ? 'Thông tin cá nhân' : 'Personal Information',
    personalSubtitle: isVi ? 'Quản lý danh tính và tùy chọn lưu trú của bạn.' : 'Manage identity details and in-stay preferences.',
    fullName: isVi ? 'Họ và tên' : 'Full Name',
    phoneNumber: isVi ? 'Số điện thoại' : 'Phone Number',
    address: isVi ? 'Địa chỉ' : 'Address',
    city: isVi ? 'Thành phố' : 'City',
    stayNotes: isVi ? 'Ghi chú lưu trú' : 'Stay Notes',
    notifications: isVi ? 'Thông báo' : 'Notifications',
    emailUpdates: isVi ? 'Cập nhật qua email' : 'Email updates',
    smsAlerts: isVi ? 'Nhắc nhở qua SMS' : 'SMS reminders',
    saveInformation: isVi ? 'Lưu thông tin' : 'Save Information',
    historyTitle: isVi ? 'Lịch sử đặt phòng' : 'Booking History',
    historySubtitle: isVi ? 'Tìm kiếm và xem lại toàn bộ đặt phòng của bạn.' : 'Search and review all your reservations.',
    historySearchPlaceholder: isVi ? 'Mã đặt phòng, tên phòng, ngày lưu trú...' : 'Booking ID, room name, stay dates...',
    allStatus: isVi ? 'Tất cả trạng thái' : 'All status',
    latest: isVi ? 'Mới nhất' : 'Latest',
    oldest: isVi ? 'Cũ nhất' : 'Oldest',
    bookingId: isVi ? 'Mã đặt phòng' : 'Booking ID',
    room: isVi ? 'Phòng' : 'Room',
    stay: isVi ? 'Lưu trú' : 'Stay',
    total: isVi ? 'Tổng tiền' : 'Total',
    payment: isVi ? 'Thanh toán' : 'Payment',
    status: isVi ? 'Trạng thái' : 'Status',
    emptyBookings: isVi ? 'Chưa có đặt phòng nào cho tài khoản này.' : 'No bookings found for this account yet.',
    paymentTitle: isVi ? 'Hóa đơn và thanh toán' : 'Invoices & Payments',
    paymentSubtitle: isVi ? 'Xem trạng thái hóa đơn và chọn phương thức thanh toán.' : 'Review billing status and choose a payment method.',
    preferredMethod: isVi ? 'Phương thức ưu tiên' : 'Preferred Method',
    pendingPayments: isVi ? 'Thanh toán chờ xử lý' : 'Pending Payments',
    billingAccount: isVi ? 'Mã thanh toán' : 'Billing Account',
    bookingUnit: isVi ? 'đặt phòng' : 'booking',
    recentInvoice: isVi ? 'Hóa đơn gần nhất' : 'Recent Invoice',
    recentInvoiceEmpty: isVi ? 'Tài khoản này chưa có hóa đơn nào được tạo.' : 'No invoice has been created for this account yet.',
    bookingPrefix: isVi ? 'Đặt phòng:' : 'Booking:',
    paymentStatus: isVi ? 'Tình trạng thanh toán' : 'Payment Status',
    noPendingPaymentMessage: isVi ? 'Không có thanh toán chờ xử lý cho tài khoản này.' : 'No pending payment for this account.',
    savePreferredMethod: isVi ? 'Lưu phương thức ưu tiên' : 'Save Preferred Method',
    payCurrentBooking: isVi ? 'Thanh toán đặt phòng hiện tại' : 'Pay Current Booking',
    securityTitle: isVi ? 'Bảo mật' : 'Security',
    securitySubtitle: isVi ? 'Bảo vệ thông tin đăng nhập và các phiên hoạt động của tài khoản.' : 'Protect your account credentials and active sessions.',
    currentPassword: isVi ? 'Mật khẩu hiện tại' : 'Current Password',
    newPassword: isVi ? 'Mật khẩu mới' : 'New Password',
    confirmNewPassword: isVi ? 'Xác nhận mật khẩu mới' : 'Confirm New Password',
    updatePassword: isVi ? 'Cập nhật mật khẩu' : 'Update Password',
    guestAccount: isVi ? 'Tài khoản khách' : 'Guest account',
    adminAccount: isVi ? 'Quản trị viên' : 'Administrator',
    bookNow: isVi ? 'Đặt ngay' : 'Book Now',
    logout: isVi ? 'Đăng xuất' : 'Logout',
    paymentMethods: {
      vietqr: 'VietQR',
    },
    statusLabels: {
      Pending: isVi ? 'Chờ xử lý' : 'Pending',
      Confirmed: isVi ? 'Đã xác nhận' : 'Confirmed',
      Cancelled: isVi ? 'Đã hủy' : 'Cancelled',
    } as Record<BookingStatus, string>,
  }

  const userEmail = user?.email ?? 'guest@vipbooking.vn'
  const [customerProfiles, setCustomerProfiles] = useState(() => readCustomerProfiles())
  const customerProfile = useMemo(
    () => customerProfiles.find((profile) => normalizeEmail(profile.email) === normalizeEmail(userEmail)),
    [customerProfiles, userEmail],
  )

  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(() => {
    const fallbackName = customerProfile?.name || toDisplayName(userEmail)
    const rawStoredSettings = window.localStorage.getItem(profileSettingsStorageKey)
    let savedSettings: Partial<ProfileSettings> = {}

    if (rawStoredSettings) {
      try {
        const parsed = JSON.parse(rawStoredSettings) as Record<string, Partial<ProfileSettings>>
        savedSettings = parsed[normalizeEmail(userEmail)] ?? {}
      } catch {
        savedSettings = {}
      }
    }

    return {
      fullName: fallbackName,
      phoneNumber: customerProfile?.phone ?? defaultProfileSettings.phoneNumber,
      address: customerProfile?.address ?? defaultProfileSettings.address,
      city: defaultProfileSettings.city,
      stayNotes: savedSettings.stayNotes ?? (language === 'vi'
        ? 'Ưu tiên phòng yên tĩnh, tầng cao và nhận phòng nhanh.'
        : defaultProfileSettings.stayNotes),
      emailUpdates: defaultProfileSettings.emailUpdates,
      smsAlerts: defaultProfileSettings.smsAlerts,
      ...savedSettings,
    }
  })

  const displayName = profileSettings.fullName || toDisplayName(userEmail)
  const memberCode = `VIP-${String(userEmail.length * 173).slice(0, 4)}`
  const accountRoleLabel = user?.role === 'admin' ? copy.adminAccount : copy.guestAccount

  useEffect(() => {
    setProfileSettings((previous) => {
      const isUsingDefaultStayNotes =
        previous.stayNotes === defaultStayNotesByLanguage.en ||
        previous.stayNotes === defaultStayNotesByLanguage.vi ||
        previous.stayNotes === defaultStayNotesLegacyVi

      if (!isUsingDefaultStayNotes) {
        return previous
      }

      const nextStayNotes =
        language === 'vi' ? defaultStayNotesByLanguage.vi : defaultStayNotesByLanguage.en

      if (previous.stayNotes === nextStayNotes) {
        return previous
      }

      return {
        ...previous,
        stayNotes: nextStayNotes,
      }
    })
  }, [language])

  useEffect(() => {
    let isMounted = true

    fetchBookings()
      .then((apiBookings) => {
        if (!isMounted) return
        setProfileBookings(apiBookings.map((booking) => ({
      id: booking.id.startsWith('#') ? booking.id : `#${booking.id}`,
      room: booking.room,
      stay: `${booking.checkIn} - ${booking.checkOut}`,
      amount: booking.amount,
      method: copy.paymentMethods.vietqr,
      status:
        booking.status === 'Cancelled'
          ? 'Cancelled'
          : booking.status === 'Pending'
            ? 'Pending'
            : 'Confirmed',
        })))
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : copy.loadBookingsMessage
        showToast({ title: copy.loadBookingsTitle, message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [copy.loadBookingsMessage, copy.loadBookingsTitle, copy.paymentMethods.vietqr, paymentMethod, showToast])

  const bookings = profileBookings

  const filteredBookings = useMemo<ProfileBooking[]>(() => {
    const query = bookingSearch.trim().toLowerCase()
    const filtered = bookings.filter((booking) => {
      const statusMatch =
        bookingStatusFilter === 'all' ||
        (bookingStatusFilter === 'pending' && booking.status === 'Pending') ||
        (bookingStatusFilter === 'confirmed' && booking.status === 'Confirmed') ||
        (bookingStatusFilter === 'cancelled' && booking.status === 'Cancelled')
      if (!statusMatch) {
        return false
      }
      if (!query) {
        return true
      }
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.room.toLowerCase().includes(query) ||
        booking.stay.toLowerCase().includes(query)
      )
    })

    return [...filtered].sort((a, b) =>
      bookingSort === 'latest' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id),
    )
  }, [bookingSearch, bookingSort, bookingStatusFilter, bookings])

  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length
  const pendingPaymentMessage = isVi
    ? `${pendingBookings} đặt phòng cần xác nhận thanh toán.`
    : `${pendingBookings} booking needs payment confirmation.`
  const paymentMethodLabel = copy.paymentMethods.vietqr

  const persistProfileSettings = (nextSettings: ProfileSettings) => {
    const rawStoredSettings = window.localStorage.getItem(profileSettingsStorageKey)
    let settingsByUser: Record<string, ProfileSettings> = {}

    if (rawStoredSettings) {
      try {
        settingsByUser = JSON.parse(rawStoredSettings) as Record<string, ProfileSettings>
      } catch {
        settingsByUser = {}
      }
    }

    settingsByUser[normalizeEmail(userEmail)] = nextSettings
    window.localStorage.setItem(profileSettingsStorageKey, JSON.stringify(settingsByUser))
  }

  const handleSaveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    persistProfileSettings(profileSettings)

    const matchedProfile = customerProfiles.find(
      (profile) => normalizeEmail(profile.email) === normalizeEmail(userEmail),
    )
    const nextProfile = {
      id: matchedProfile?.id ?? `CUS-${String(userEmail.length * 173).padStart(4, '0').slice(0, 4)}`,
      email: userEmail,
      name: profileSettings.fullName.trim() || toDisplayName(userEmail),
      phone: profileSettings.phoneNumber.trim() || defaultProfileSettings.phoneNumber,
      address: profileSettings.address.trim() || defaultProfileSettings.address,
      status: matchedProfile?.status ?? 'Active',
      tier: matchedProfile?.tier ?? 'Standard',
    }
    const nextProfiles = matchedProfile
      ? customerProfiles.map((profile) =>
          normalizeEmail(profile.email) === normalizeEmail(userEmail) ? nextProfile : profile,
        )
      : [nextProfile, ...customerProfiles]

    saveCustomerProfiles(nextProfiles)
    setCustomerProfiles(nextProfiles)
    showToast({ title: copy.profileUpdatedTitle, message: copy.profileUpdatedMessage, variant: 'success' })
  }

  const handleSavePaymentMethod = () => {
    window.localStorage.setItem('vip-booking:preferred-payment', paymentMethod)
    showToast({ title: copy.paymentSavedTitle, message: copy.paymentSavedMessage, variant: 'success' })
  }

  const handlePayCurrentBooking = () => {
    window.localStorage.setItem('vip-booking:preferred-payment', paymentMethod)
    const pendingBooking = bookings.find((booking) => booking.status === 'Pending')
    if (pendingBooking) {
      setActiveBookingId(pendingBooking.id)
      navigate('payment')
      return
    }

    showToast({ title: copy.noPendingBookingTitle, message: copy.noPendingBookingMessage, variant: 'warning' })
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const currentPassword = String(formData.get('currentPassword') ?? '')
    const nextPassword = String(formData.get('nextPassword') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (!currentPassword || !nextPassword || !confirmPassword) {
      showToast({ title: copy.passwordIncompleteTitle, message: copy.passwordIncompleteMessage, variant: 'error' })
      return
    }

    if (nextPassword !== confirmPassword) {
      showToast({ title: copy.passwordMismatchTitle, message: copy.passwordMismatchMessage, variant: 'error' })
      return
    }

    if (!(await changePassword(currentPassword, nextPassword))) {
      showToast({ title: copy.passwordFailedTitle, message: copy.passwordFailedMessage, variant: 'error' })
      return
    }

    showToast({ title: copy.passwordUpdatedTitle, message: copy.passwordUpdatedMessage, variant: 'success' })
    event.currentTarget.reset()
  }

  const sectionHeader = (title: string, subtitle: string) => (
    <div className="profile-section-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )

  const renderPersonal = () => (
    <section className={panelClass}>
      {sectionHeader(copy.personalTitle, copy.personalSubtitle)}
      <form className="profile-form-grid" onSubmit={handleSaveProfile}>
        <label>
          {copy.fullName}
          <input
            className={inputClass}
            value={profileSettings.fullName}
            onChange={(event) =>
              setProfileSettings((previous) => ({ ...previous, fullName: event.target.value }))
            }
          />
        </label>
        <label>
          {copy.phoneNumber}
          <input
            className={inputClass}
            value={profileSettings.phoneNumber}
            onChange={(event) =>
              setProfileSettings((previous) => ({ ...previous, phoneNumber: event.target.value }))
            }
          />
        </label>
        <label>
          {copy.address}
          <input
            className={inputClass}
            value={profileSettings.address}
            onChange={(event) =>
              setProfileSettings((previous) => ({ ...previous, address: event.target.value }))
            }
          />
        </label>
        <label>
          {copy.city}
          <input
            className={inputClass}
            value={profileSettings.city}
            onChange={(event) =>
              setProfileSettings((previous) => ({ ...previous, city: event.target.value }))
            }
          />
        </label>
        <label className="profile-span-2">
          {copy.stayNotes}
          <textarea
            className={textareaClass}
            value={profileSettings.stayNotes}
            onChange={(event) =>
              setProfileSettings((previous) => ({ ...previous, stayNotes: event.target.value }))
            }
          />
        </label>
        <div className="profile-notification-card profile-span-2">
          <p>{copy.notifications}</p>
          <div className="profile-checkbox-grid">
            <label className="check-row">
              <input
                checked={profileSettings.emailUpdates}
                type="checkbox"
                onChange={(event) =>
                  setProfileSettings((previous) => ({ ...previous, emailUpdates: event.target.checked }))
                }
              />
              {copy.emailUpdates}
            </label>
            <label className="check-row">
              <input
                checked={profileSettings.smsAlerts}
                type="checkbox"
                onChange={(event) =>
                  setProfileSettings((previous) => ({ ...previous, smsAlerts: event.target.checked }))
                }
              />
              {copy.smsAlerts}
            </label>
          </div>
        </div>
        <div className="profile-span-2">
          <button
            className="primary-button"
            type="submit"
          >
            {copy.saveInformation}
          </button>
        </div>
      </form>
    </section>
  )

  const renderHistory = () => (
    <section className={panelClass}>
      {sectionHeader(copy.historyTitle, copy.historySubtitle)}
      <div className="profile-filter-grid">
        <input
          className={inputClass}
          value={bookingSearch}
          placeholder={copy.historySearchPlaceholder}
          onChange={(event) => setBookingSearch(event.target.value)}
        />
        <select
          className={inputClass}
          value={bookingStatusFilter}
          onChange={(event) =>
            setBookingStatusFilter(event.target.value as 'all' | 'pending' | 'confirmed' | 'cancelled')
          }
        >
          <option value="all">{copy.allStatus}</option>
          <option value="pending">{copy.statusLabels.Pending}</option>
          <option value="confirmed">{copy.statusLabels.Confirmed}</option>
          <option value="cancelled">{copy.statusLabels.Cancelled}</option>
        </select>
        <select
          className={inputClass}
          value={bookingSort}
          onChange={(event) => setBookingSort(event.target.value as 'latest' | 'oldest')}
        >
          <option value="latest">{copy.latest}</option>
          <option value="oldest">{copy.oldest}</option>
        </select>
      </div>

      <div className="profile-table-shell">
        <div className="profile-booking-table">
          <div className="profile-booking-row profile-booking-head">
            <span>{copy.bookingId}</span>
            <span>{copy.room}</span>
            <span>{copy.stay}</span>
            <span>{copy.total}</span>
            <span>{copy.payment}</span>
            <span>{copy.status}</span>
          </div>
          {filteredBookings.map((booking) => (
            <div
              className="profile-booking-row"
              key={booking.id}
            >
              <span>{booking.id}</span>
              <span>{booking.room}</span>
              <span>{booking.stay}</span>
              <span>{booking.amount}</span>
              <span>{booking.method}</span>
              <span
                className={
                  booking.status === 'Confirmed'
                    ? 'profile-status success'
                    : booking.status === 'Pending'
                      ? 'profile-status pending'
                      : 'profile-status failed'
                }
              >
                {copy.statusLabels[booking.status]}
              </span>
            </div>
          ))}
          {filteredBookings.length === 0 && (
            <p className="profile-empty-state">{copy.emptyBookings}</p>
          )}
        </div>
      </div>
    </section>
  )

  const renderPayment = () => (
    <section className={panelClass}>
      {sectionHeader(copy.paymentTitle, copy.paymentSubtitle)}
      <div className="profile-stat-grid">
        <article className="profile-stat-card">
          <p>{copy.preferredMethod}</p>
          <strong>{paymentMethodLabel}</strong>
        </article>
        <article className="profile-stat-card">
          <p>{copy.pendingPayments}</p>
          <strong>{pendingBookings} {copy.bookingUnit}</strong>
        </article>
        <article className="profile-stat-card">
          <p>{copy.billingAccount}</p>
          <strong>{memberCode}</strong>
        </article>
      </div>

      <div className="profile-detail-grid">
        <article className="profile-mini-card">
          <h3>{copy.recentInvoice}</h3>
          {bookings[0] ? (
            <div>
              <strong>{bookings[0].amount}</strong>
              <p>{bookings[0].room}</p>
              <small>{copy.bookingPrefix} {bookings[0].id}</small>
            </div>
          ) : (
            <p>{copy.recentInvoiceEmpty}</p>
          )}
        </article>
        <article className="profile-mini-card">
          <h3>{copy.paymentStatus}</h3>
          <p>
            {pendingBookings > 0
              ? pendingPaymentMessage
              : copy.noPendingPaymentMessage}
          </p>
        </article>
      </div>

      <label className="profile-field-block">
        {copy.preferredMethod}
        <select
          className={inputClass}
          value={paymentMethod}
          onChange={(event) => {
            setPaymentMethod(event.target.value)
          }}
        >
          <option value="vietqr">{copy.paymentMethods.vietqr}</option>
        </select>
      </label>

      <div className="profile-actions-row">
        <button
          className="secondary-button"
          type="button"
          onClick={handleSavePaymentMethod}
        >
          {copy.savePreferredMethod}
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={handlePayCurrentBooking}
        >
          {copy.payCurrentBooking}
        </button>
      </div>
    </section>
  )

  const renderSecurity = () => (
    <section className={panelClass}>
      {sectionHeader(copy.securityTitle, copy.securitySubtitle)}

      <form className="profile-form-grid" onSubmit={handleChangePassword}>
        <label className="profile-span-2">
          {copy.currentPassword}
          <input className={inputClass} name="currentPassword" type="password" required />
        </label>
        <label>
          {copy.newPassword}
          <input className={inputClass} name="nextPassword" type="password" required />
        </label>
        <label>
          {copy.confirmNewPassword}
          <input className={inputClass} name="confirmPassword" type="password" required />
        </label>
        <div className="profile-span-2">
          <button
            className="primary-button"
            type="submit"
          >
            {copy.updatePassword}
          </button>
        </div>
      </form>
    </section>
  )

  const renderActiveSection = () => {
    if (activeSection === 'profile-personal') return renderPersonal()
    if (activeSection === 'profile-history') return renderHistory()
    if (activeSection === 'profile-payment') return renderPayment()
    return renderSecurity()
  }

  return (
    <main className="profile-page">
      <section className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="profile-avatar">
              <Icon name="user" size={22} />
            </div>
            <strong>{displayName}</strong>
            <p>{userEmail}</p>
            <small>{accountRoleLabel}</small>
          </div>

          <div className="profile-nav">
            {copy.sidebarSections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <button
                  className={`profile-nav-button ${isActive ? 'active' : ''}`}
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                >
                  <div>
                    <Icon name={section.icon} size={15} />
                    <span>{section.label}</span>
                  </div>
                  <p>{section.hint}</p>
                </button>
              )
            })}
          </div>

          <button
            className="secondary-button full-width"
            type="button"
            onClick={() => navigate('rooms')}
          >
            {copy.bookNow}
          </button>
          <button
            className="ghost-button full-width"
            type="button"
            onClick={() => {
              logout()
              navigate('home')
            }}
          >
            {copy.logout}
          </button>
        </aside>

        <div className="profile-content">
          {renderActiveSection()}
        </div>
      </section>
    </main>
  )
}
