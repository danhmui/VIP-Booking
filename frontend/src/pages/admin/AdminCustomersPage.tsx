import { useEffect, useMemo, useState } from 'react'
import { deleteUserWithApi, fetchBookings, fetchUsers } from '../../api/vipBookingApi'
import { Icon } from '../../components/icons/Icon'
import { useToast } from '../../context/ToastContext'
import type { BookingRecord, RegisteredUser } from '../../types'

const adminCustomersSearchKey = 'vip-booking:admin-customers-search'

function displayNameFromEmail(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function parseBookingAmount(amount: string) {
  return Number(amount.replace(/\D/g, '')) || 0
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

type CustomerView = {
  id: string
  email: string
  name: string
  phone: string
  status: RegisteredUser['status']
  bookings: number
  totalSpent: number
}

export function AdminCustomersPage() {
  const { confirmToast, showToast } = useToast()
  const [search, setSearch] = useState(() => {
    const value = window.sessionStorage.getItem(adminCustomersSearchKey) ?? ''
    window.sessionStorage.removeItem(adminCustomersSearchKey)
    return value
  })
  const [statusFilter, setStatusFilter] = useState<'All Customers' | NonNullable<RegisteredUser['status']>>('All Customers')
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])

  const reloadCustomers = async () => {
    const [nextUsers, nextBookings] = await Promise.all([fetchUsers(), fetchBookings()])
    setUsers(nextUsers)
    setBookings(nextBookings)
  }

  useEffect(() => {
    reloadCustomers().catch((error) => {
      const message = error instanceof Error ? error.message : 'Could not load customers.'
      showToast({ title: 'Could not load customers', message, variant: 'error' })
    })
  }, [showToast])

  const customers = useMemo<CustomerView[]>(() => {
    return users
      .filter((user) => user.role !== 'admin')
      .map((user) => {
        const normalizedEmail = normalizeEmail(user.email)
        const customerBookings = bookings.filter((booking) => {
          const ownerEmail = normalizeEmail(booking.ownerEmail ?? booking.email)
          return ownerEmail === normalizedEmail
        })
        const totalSpent = customerBookings.reduce(
          (total, booking) => total + parseBookingAmount(booking.amount),
          0,
        )

        return {
          id: user.id ?? '',
          email: user.email,
          name: user.fullName || displayNameFromEmail(user.email),
          phone: user.phone || '-',
          status: user.status ?? 'active',
          bookings: customerBookings.length,
          totalSpent,
        }
      })
  }, [bookings, users])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return customers.filter((customer) => {
      const statusMatch = statusFilter === 'All Customers' || customer.status === statusFilter
      const searchMatch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      return statusMatch && searchMatch
    })
  }, [customers, search, statusFilter])

  const totalSpent = customers.reduce((total, customer) => total + customer.totalSpent, 0)
  const activeCount = customers.filter((customer) => customer.status === 'active').length
  const lockedCount = customers.filter((customer) => customer.status === 'locked').length

  const handleDeleteCustomer = async (customer: CustomerView) => {
    const shouldDelete = await confirmToast({
      title: 'Delete customer?',
      message: `Delete customer "${customer.email}"?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete || !customer.id) {
      return
    }

    try {
      const message = await deleteUserWithApi(customer.id)
      await reloadCustomers()
      showToast({ title: 'Customer deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete customer.'
      showToast({ title: 'Could not delete customer', message, variant: 'error' })
    }
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid">
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="users" />
          </span>
          <p>Total Customers</p>
          <strong>{customers.length}</strong>
          <small>guest accounts</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="check" />
          </span>
          <p>Active Customers</p>
          <strong>{activeCount}</strong>
          <small>active database users</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="lock" />
          </span>
          <p>Locked Customers</p>
          <strong>{lockedCount}</strong>
          <small>restricted accounts</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="card" />
          </span>
          <p>Total Spent</p>
          <strong>{totalSpent.toLocaleString('vi-VN')} VND</strong>
          <small>booking history</small>
        </article>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="panel-title">
            <Icon name="users" />
            <span>Customer Management</span>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={search}
              placeholder="Search by ID, name, email, or phone..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {(['All Customers', 'active', 'inactive', 'locked'] as const).map((status) => (
            <button
              key={status}
              className={`ghost-button compact ${statusFilter === status ? 'border-slate-500 text-white' : ''}`}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'All Customers' ? status : status}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Bookings</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id || customer.email}>
                  <td>#{customer.id || '-'}</td>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.bookings}</td>
                  <td>{customer.totalSpent.toLocaleString('vi-VN')} VND</td>
                  <td>
                    <span className={`status-chip ${customer.status === 'active' ? 'success' : 'failed'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => handleDeleteCustomer(customer)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8}>No customers found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
