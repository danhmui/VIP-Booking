import type { IconName, RouteKey } from '../types'

export const navItems: Array<{ label: string; route: RouteKey }> = [
  { label: 'Home', route: 'home' },
  { label: 'Rooms', route: 'rooms' },
  { label: 'Contact', route: 'contact' },
  { label: 'About', route: 'about' },
]

export const adminNavItems: Array<{ label: string; route: RouteKey; icon: IconName }> = [
  { label: 'Overview', route: 'admin', icon: 'dashboard' },
  { label: 'Bookings', route: 'adminBookings', icon: 'calendar' },
  { label: 'Operations', route: 'adminOperations', icon: 'bed' },
  { label: 'Billing', route: 'adminBilling', icon: 'card' },
  { label: 'Room Types', route: 'adminRooms', icon: 'bed' },
  { label: 'Services', route: 'adminServices', icon: 'service' },
  { label: 'Customers', route: 'adminCustomers', icon: 'users' },
  { label: 'User Roles', route: 'adminUsers', icon: 'shield' },
]
