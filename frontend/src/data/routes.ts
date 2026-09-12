import type { RouteKey } from '../types'

export const routePaths: Record<RouteKey, string> = {
  home: 'home',
  rooms: 'rooms',
  roomDetail: 'rooms/ocean-view-grand-suite',
  booking: 'booking-information',
  confirm: 'confirm-booking',
  payment: 'secure-payment',
  success: 'payment-success',
  failed: 'payment-failed',
  contact: 'contact',
  about: 'about',
  profile: 'profile',
  login: 'login',
  register: 'register',
  forgot: 'forgot-password',
  reset: 'reset-password',
  otp: 'otp',
  admin: 'admin',
  adminRooms: 'admin/room-types',
  adminServices: 'admin/services',
  adminBookings: 'admin/bookings',
  adminOperations: 'admin/operations',
  adminBilling: 'admin/billing',
  adminCustomers: 'admin/customers',
  adminUsers: 'admin/users',
  notFound: '404',
}

export const routeTitles: Record<RouteKey, string> = {
  home: 'Home Page - VIP Booking',
  rooms: 'Room Listing - VIP Booking',
  roomDetail: 'Room Detail - VIP Booking',
  booking: 'Booking Information - VIP Booking',
  confirm: 'Confirm Your Booking - VIP Booking',
  payment: 'Secure Payment - VIP Booking',
  success: 'Payment Success - VIP Booking',
  failed: 'Payment Failed - VIP Booking',
  contact: 'Contact - VIP Booking',
  about: 'About - VIP Booking',
  profile: 'Profile - VIP Booking',
  login: 'Login - VIP Booking',
  register: 'Register - VIP Booking',
  forgot: 'Forgot Password - VIP Booking',
  reset: 'Reset Password - VIP Booking',
  otp: 'OTP - VIP Booking',
  admin: 'Admin Dashboard - VIP Booking',
  adminRooms: 'Room Types Management - VIP Booking',
  adminServices: 'Service Management - VIP Booking',
  adminBookings: 'Booking Management - VIP Booking',
  adminOperations: 'Hotel Operations - VIP Booking',
  adminBilling: 'Billing Management - VIP Booking',
  adminCustomers: 'Customer Management - VIP Booking',
  adminUsers: 'User Role Management - VIP Booking',
  notFound: '404 - VIP Booking',
}

export const routeByPath = Object.entries(routePaths).reduce<Record<string, RouteKey>>(
  (acc, [key, value]) => {
    acc[value] = key as RouteKey
    return acc
  },
  {},
)

export const authRouteKeys: RouteKey[] = ['login', 'register', 'forgot', 'reset', 'otp']
export const protectedRouteKeys: RouteKey[] = ['booking', 'confirm', 'payment', 'success', 'failed', 'profile']
export const adminRouteKeys: RouteKey[] = [
  'admin',
  'adminRooms',
  'adminServices',
  'adminBookings',
  'adminOperations',
  'adminBilling',
  'adminCustomers',
  'adminUsers',
]
export const privateRouteKeys: RouteKey[] = [...protectedRouteKeys, ...adminRouteKeys]
