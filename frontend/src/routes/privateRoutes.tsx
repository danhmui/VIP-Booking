import { AdminLayout } from '../components/layout/AdminLayout'
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage'
import { AdminBillingPage } from '../pages/admin/AdminBillingPage'
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminOperationsPage } from '../pages/admin/AdminOperationsPage'
import { AdminRoomTypesPage } from '../pages/admin/AdminRoomTypesPage'
import { AdminServicesPage } from '../pages/admin/AdminServicesPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import type { AppRoute } from '../types'

export const privateRoutes: AppRoute[] = [
  {
    key: 'admin',
    element: () => (
      <AdminLayout currentRoute="admin">
        <AdminDashboardPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminBookings',
    element: () => (
      <AdminLayout currentRoute="adminBookings">
        <AdminBookingsPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminOperations',
    element: () => (
      <AdminLayout currentRoute="adminOperations">
        <AdminOperationsPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminBilling',
    element: () => (
      <AdminLayout currentRoute="adminBilling">
        <AdminBillingPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminRooms',
    element: () => (
      <AdminLayout currentRoute="adminRooms">
        <AdminRoomTypesPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminServices',
    element: () => (
      <AdminLayout currentRoute="adminServices">
        <AdminServicesPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminCustomers',
    element: () => (
      <AdminLayout currentRoute="adminCustomers">
        <AdminCustomersPage />
      </AdminLayout>
    ),
  },
  {
    key: 'adminUsers',
    element: () => (
      <AdminLayout currentRoute="adminUsers">
        <AdminUsersPage />
      </AdminLayout>
    ),
  },
]
