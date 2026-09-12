import type { ReactNode } from 'react'

export type RouteKey =
  | 'home'
  | 'rooms'
  | 'roomDetail'
  | 'booking'
  | 'confirm'
  | 'payment'
  | 'success'
  | 'failed'
  | 'contact'
  | 'about'
  | 'profile'
  | 'login'
  | 'register'
  | 'forgot'
  | 'reset'
  | 'otp'
  | 'admin'
  | 'adminRooms'
  | 'adminServices'
  | 'adminBookings'
  | 'adminOperations'
  | 'adminBilling'
  | 'adminCustomers'
  | 'adminUsers'
  | 'notFound'

export type IconName =
  | 'award'
  | 'bell'
  | 'bed'
  | 'calendar'
  | 'card'
  | 'check'
  | 'chevron'
  | 'close'
  | 'dashboard'
  | 'eye'
  | 'eyeOff'
  | 'edit'
  | 'filter'
  | 'home'
  | 'lock'
  | 'mail'
  | 'mapPin'
  | 'menu'
  | 'moon'
  | 'phone'
  | 'plus'
  | 'search'
  | 'service'
  | 'shield'
  | 'spark'
  | 'star'
  | 'sun'
  | 'trash'
  | 'user'
  | 'users'
  | 'wifi'

export type Room = {
  id: string
  roomNumber?: string
  floor?: number
  status?: 'available' | 'booked' | 'occupied' | 'maintenance'
  typeId?: string
  name: string
  category: string
  location: string
  price: number
  rating: number
  reviews: number
  size: string
  guests: string
  bed: string
  image: string
  gallery: string[]
  description: string
  amenities: string[]
  highlights: string[]
  availability: number[]
}

export type PricingRule = {
  id: string
  name: string
  roomType: string
  trigger: string
  adjustment: string
  startDate: string
  endDate: string
}

export type CustomerStatus = 'Active' | 'Disabled'
export type CustomerTier = 'VIP GOLD' | 'Corporate Account' | 'Standard'

export type CustomerProfile = {
  id: string
  email: string
  name: string
  phone: string
  address: string
  status: CustomerStatus
  tier: CustomerTier
}

export type Service = {
  id?: string
  name: string
  icon: IconName
  price: string
  note: string
  status: 'Active' | 'Paused'
}

export type RegisteredUser = {
  id?: string
  email: string
  password: string
  role: 'guest' | 'admin'
  fullName?: string
  phone?: string | null
  status?: 'active' | 'inactive' | 'locked'
  roleId?: string
}

export type SupportInfo = {
  hotline: string
  email: string
  address: string
  badges: string[]
}

export type ContactMessageStatus = 'New' | 'Handled'

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  status: ContactMessageStatus
}

export type BookingRecord = {
  id: string
  ownerEmail?: string
  guest: string
  email: string
  room: string
  bookingDate: string
  checkIn: string
  checkOut: string
  amount: string
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

export type CheckInOutRecord = {
  id: string
  bookingId: string
  roomId: string
  roomLabel: string
  staffName: string
  checkInTime: string
  checkOutTime: string
  status: 'checked_in' | 'checked_out'
  note: string
}

export type ServiceUsageRecord = {
  id: string
  bookingId: string
  serviceId: string
  serviceName: string
  quantity: number
  unitPrice: string
  subtotal: string
  usedAt: string
  note: string
}

export type InvoiceRecord = {
  id: string
  bookingId: string
  code: string
  guest: string
  issuedDate: string
  roomAmount: string
  serviceAmount: string
  totalAmount: string
  status: 'unpaid' | 'partial_paid' | 'paid' | 'cancelled'
  note: string
}

export type PaymentRecord = {
  id: string
  invoiceId: string
  invoiceCode: string
  amount: string
  method: 'cash' | 'bank_transfer' | 'online'
  status: 'pending' | 'success' | 'failed' | 'refunded'
  paidAt: string
  staffName: string
}

export type NavigateOptions = {
  path?: string
}

export type Navigate = (route: RouteKey, options?: NavigateOptions) => void

export type AppRoute = {
  key: RouteKey
  element: (navigate: Navigate) => ReactNode
}
