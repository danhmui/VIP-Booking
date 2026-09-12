import type { AppLanguage } from '../context/LanguageContext'
import type {
  BookingRecord,
  ContactMessage,
  ContactMessageStatus,
  CustomerProfile,
  RegisteredUser,
  SupportInfo,
} from '../types'

export const registeredUsersStorageKey = 'vip-booking-registered-users'
export const customerProfilesStorageKey = 'vip-booking-customer-profiles'
export const bookingsStorageKey = 'vip-booking-bookings'
export const activeBookingIdStorageKey = 'vip-booking-active-booking-id'
export const activePaymentIdStorageKey = 'vip-booking-active-payment-id'
export const supportInfoStorageKey = 'vip-booking-support-info'
export const contactMessagesStorageKey = 'vip-booking-contact-messages'

const legacySupportAddress = '12 Nguyen Hue, Ho Chi Minh City'
const legacySupportEmail = 'guest@vipbooking.vn'
const supportAddressVi = '180 Cao Lỗ, Phường Chánh Hưng, Tp. Hồ Chí Minh'
const supportAddressEn = '180 Cao Lo Street, Chanh Hung Ward, Ho Chi Minh City'

const defaultSupportInfo: SupportInfo = {
  hotline: '+84 901 123 456',
  email: 'admin@vipbooking.local',
  address: supportAddressVi,
  badges: ['Luxury Stays', 'Secure Checkout', 'Priority Service'],
}

export function localizeSupportAddress(address: string, language: AppLanguage) {
  if (address === supportAddressVi || address === supportAddressEn || address === legacySupportAddress) {
    return language === 'vi' ? supportAddressVi : supportAddressEn
  }

  return address
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function parseArrayStorage<T>(key: string): T[] | null {
  const rawValue = localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    const value = JSON.parse(rawValue) as T[]
    return Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

export function readRegisteredUsers(): RegisteredUser[] {
  return parseArrayStorage<RegisteredUser>(registeredUsersStorageKey) ?? []
}

export function readCustomerProfiles(): CustomerProfile[] {
  return parseArrayStorage<CustomerProfile>(customerProfilesStorageKey) ?? []
}

export function saveCustomerProfiles(profiles: CustomerProfile[]) {
  localStorage.setItem(customerProfilesStorageKey, JSON.stringify(profiles))
}

export function readBookings(): BookingRecord[] {
  return parseArrayStorage<BookingRecord>(bookingsStorageKey) ?? []
}

export function saveBookings(bookings: BookingRecord[]) {
  localStorage.setItem(bookingsStorageKey, JSON.stringify(bookings))
}

export function saveBooking(booking: BookingRecord) {
  const bookings = readBookings()
  saveBookings([booking, ...bookings])
}

export function readBookingsByOwner(userEmail: string): BookingRecord[] {
  const normalizedUserEmail = normalizeEmail(userEmail)
  if (!normalizedUserEmail) {
    return []
  }

  return readBookings().filter((booking) => {
    const bookingOwnerEmail = booking.ownerEmail ?? booking.email
    return normalizeEmail(bookingOwnerEmail) === normalizedUserEmail
  })
}

export function updateBookingStatus(bookingId: string, status: BookingRecord['status']) {
  const bookings = readBookings()
  const normalizedId = bookingId.startsWith('#') ? bookingId.slice(1) : bookingId
  const updatedBookings = bookings.map((booking) =>
    booking.id === normalizedId || booking.id === bookingId ? { ...booking, status } : booking,
  )

  saveBookings(updatedBookings)
}

export function setActiveBookingId(bookingId: string) {
  window.sessionStorage.setItem(activeBookingIdStorageKey, bookingId)
}

export function getActiveBookingId() {
  return window.sessionStorage.getItem(activeBookingIdStorageKey)
}

export function clearActiveBookingId() {
  window.sessionStorage.removeItem(activeBookingIdStorageKey)
}

export function setActivePaymentId(paymentId: string) {
  window.localStorage.setItem(activePaymentIdStorageKey, paymentId)
}

export function getActivePaymentId() {
  return window.localStorage.getItem(activePaymentIdStorageKey)
}

export function clearActivePaymentId() {
  window.localStorage.removeItem(activePaymentIdStorageKey)
}

export function updateActiveBookingStatus(status: BookingRecord['status']) {
  const activeBookingId = getActiveBookingId()
  if (!activeBookingId) {
    return
  }

  updateBookingStatus(activeBookingId, status)
}

export function readSupportInfo(): SupportInfo {
  const rawSupportInfo = localStorage.getItem(supportInfoStorageKey)
  if (!rawSupportInfo) {
    localStorage.setItem(supportInfoStorageKey, JSON.stringify(defaultSupportInfo))
    return defaultSupportInfo
  }

  try {
    const parsedSupportInfo = JSON.parse(rawSupportInfo) as Partial<SupportInfo>
    const normalizedAddress =
      parsedSupportInfo.address === legacySupportAddress ? supportAddressVi : parsedSupportInfo.address
    const normalizedEmail =
      parsedSupportInfo.email === legacySupportEmail ? defaultSupportInfo.email : parsedSupportInfo.email

    return {
      ...defaultSupportInfo,
      ...parsedSupportInfo,
      email: normalizedEmail ?? defaultSupportInfo.email,
      address: normalizedAddress ?? defaultSupportInfo.address,
      badges: Array.isArray(parsedSupportInfo.badges)
        ? parsedSupportInfo.badges.filter(Boolean).slice(0, 6)
        : defaultSupportInfo.badges,
    }
  } catch {
    localStorage.setItem(supportInfoStorageKey, JSON.stringify(defaultSupportInfo))
    return defaultSupportInfo
  }
}

export function saveSupportInfo(supportInfo: SupportInfo) {
  localStorage.setItem(
    supportInfoStorageKey,
    JSON.stringify({
      ...supportInfo,
      badges: supportInfo.badges.filter(Boolean).slice(0, 6),
    }),
  )
}

export function readContactMessages(): ContactMessage[] {
  const messages = parseArrayStorage<ContactMessage>(contactMessagesStorageKey)
  return messages ?? []
}

export function saveContactMessage(
  message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>,
) {
  const contactMessages = readContactMessages()
  const nextMessage: ContactMessage = {
    ...message,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'New',
  }
  localStorage.setItem(contactMessagesStorageKey, JSON.stringify([nextMessage, ...contactMessages]))
}

export function updateContactMessageStatus(messageId: string, status: ContactMessageStatus) {
  const contactMessages = readContactMessages()
  const nextMessages = contactMessages.map((message) =>
    message.id === messageId ? { ...message, status } : message,
  )
  localStorage.setItem(contactMessagesStorageKey, JSON.stringify(nextMessages))
}
