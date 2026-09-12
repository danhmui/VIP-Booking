import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { deleteBookingWithApi, fetchBookings, updateBookingWithApi } from '../../api/vipBookingApi'
import { Icon } from '../../components/icons/Icon'
import { useToast } from '../../context/ToastContext'
import type { BookingRecord } from '../../types'

const adminBookingsFilterKey = 'vip-booking:admin-bookings-filter'
const adminBookingsSearchKey = 'vip-booking:admin-bookings-search'

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function parseAmount(amount: string) {
  return Number(amount.replace(/\D/g, '')) || 0
}

function getOperationalStatus(booking: BookingRecord) {
  const today = new Date()
  const checkIn = new Date(booking.checkIn)
  const checkOut = new Date(booking.checkOut)

  if (booking.status === 'Cancelled') return 'Cancelled'
  if (booking.status === 'Pending') return 'Confirm booking'
  if (!Number.isNaN(checkOut.getTime()) && today > checkOut) return 'Check-out review'
  if (!Number.isNaN(checkIn.getTime()) && today >= checkIn) return 'Ready for check-in'
  return 'Upcoming stay'
}

export function AdminBookingsPage() {
  const { confirmToast, showToast } = useToast()
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [search, setSearch] = useState(() => {
    const value = window.sessionStorage.getItem(adminBookingsSearchKey) ?? ''
    window.sessionStorage.removeItem(adminBookingsSearchKey)
    return value
  })
  const [statusFilter, setStatusFilter] = useState<'All' | BookingRecord['status']>(() => {
    const value = window.sessionStorage.getItem(adminBookingsFilterKey)
    window.sessionStorage.removeItem(adminBookingsFilterKey)

    if (value === 'Pending' || value === 'Confirmed' || value === 'Cancelled' || value === 'All') {
      return value
    }

    return 'All'
  })
  const [bookings, setBookings] = useState<BookingRecord[]>([])

  const reloadBookings = async () => {
    setBookings(await fetchBookings())
  }

  useEffect(() => {
    reloadBookings().catch((error) => {
      const message = error instanceof Error ? error.message : 'Could not load bookings.'
      showToast({ title: 'Could not load bookings', message, variant: 'error' })
    })
  }, [showToast])

  const filteredBookings = useMemo(() => {
    const query = normalizeQuery(search)
    return bookings.filter((booking) => {
      const statusMatch = statusFilter === 'All' || booking.status === statusFilter
      const textMatch =
        !query ||
        booking.id.toLowerCase().includes(query) ||
        booking.guest.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.room.toLowerCase().includes(query)
      return statusMatch && textMatch
    })
  }, [bookings, search, statusFilter])

  const unpaidTotal = bookings
    .filter((booking) => booking.status === 'Pending')
    .reduce((total, booking) => total + parseAmount(booking.amount), 0)

  const handleStatusChange = async (bookingId: string, status: BookingRecord['status']) => {
    try {
      const booking = await updateBookingWithApi(bookingId, { status })
      await reloadBookings()
      showToast({ title: 'Booking updated', message: booking.apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update booking status.'
      showToast({ title: 'Could not update booking', message, variant: 'error' })
    }
  }

  const openAddBookingModal = () => {
    setActiveBooking(null)
    setIsBookingModalOpen(true)
  }

  const openEditBookingModal = (booking: BookingRecord) => {
    setActiveBooking(booking)
    setIsBookingModalOpen(true)
  }

  const closeBookingModal = () => {
    setActiveBooking(null)
    setIsBookingModalOpen(false)
  }

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const checkIn = String(formData.get('checkIn') ?? '')
    const checkOut = String(formData.get('checkOut') ?? '')
    const status = String(formData.get('status') ?? 'Pending') as BookingRecord['status']

    if (!activeBooking) {
      showToast({
        title: 'Cannot create booking here',
        message: 'Please create new bookings from the customer booking flow so room/user constraints stay valid.',
        variant: 'warning',
      })
      return
    }

    if (!checkIn || !checkOut) {
      return
    }

    try {
      const booking = await updateBookingWithApi(activeBooking.id, {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: 1,
        status,
      })
      await reloadBookings()
      closeBookingModal()
      showToast({ title: 'Booking saved', message: booking.apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save booking.'
      showToast({ title: 'Could not save booking', message, variant: 'error' })
    }
  }

  const handleDeleteBooking = async (booking: BookingRecord) => {
    const shouldDelete = await confirmToast({
      title: 'Delete booking?',
      message: `Delete booking #${booking.id}?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete) {
      return
    }

    try {
      const message = await deleteBookingWithApi(booking.id)
      await reloadBookings()
      showToast({ title: 'Booking deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete booking.'
      showToast({ title: 'Could not delete booking', message, variant: 'error' })
    }
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid">
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="calendar" />
          </span>
          <p>Total Bookings</p>
          <strong>{bookings.length}</strong>
          <small>all reservations</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="check" />
          </span>
          <p>Confirmed</p>
          <strong>{bookings.filter((booking) => booking.status === 'Confirmed').length}</strong>
          <small>paid or approved</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="bell" />
          </span>
          <p>Pending</p>
          <strong>{bookings.filter((booking) => booking.status === 'Pending').length}</strong>
          <small>awaiting review</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="card" />
          </span>
          <p>Pending Amount</p>
          <strong>{unpaidTotal.toLocaleString('vi-VN')} VND</strong>
          <small>from pending bookings</small>
        </article>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="panel-title">
            <Icon name="calendar" />
            <span>Booking Management</span>
          </div>
          <button className="primary-button compact" type="button" onClick={openAddBookingModal}>
            <Icon name="plus" />
            Add Booking
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={search}
              placeholder="Search by booking ID, guest, room, or email..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {(['All', 'Pending', 'Confirmed', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              className={`ghost-button compact ${statusFilter === status ? 'border-slate-500 text-white' : ''}`}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Email</th>
                <th>Room</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Operation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.guest}</td>
                  <td>{booking.email}</td>
                  <td>{booking.room}</td>
                  <td>{booking.checkIn}</td>
                  <td>{booking.checkOut}</td>
                  <td>{booking.amount}</td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(event) =>
                        handleStatusChange(booking.id, event.target.value as BookingRecord['status'])
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{getOperationalStatus(booking)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => openEditBookingModal(booking)}>
                        Edit
                      </button>
                      <button className="link-button" type="button" onClick={() => handleDeleteBooking(booking)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={10}>No bookings found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isBookingModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-form-title"
          >
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">Reservation</p>
                <h2 id="booking-form-title">{activeBooking ? 'Edit Booking' : 'Add Booking'}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close booking form"
                onClick={closeBookingModal}
              >
                <Icon name="close" />
              </button>
            </div>
            <form className="admin-room-form" onSubmit={handleBookingSubmit}>
              <label>
                Guest name
                <input name="guest" defaultValue={activeBooking?.guest} placeholder="Guest name" required />
              </label>
              <label>
                Email
                <input name="email" defaultValue={activeBooking?.email} placeholder="guest@email.com" required type="email" />
              </label>
              <label>
                Room
                <input name="room" defaultValue={activeBooking?.room} placeholder="Ocean View Suite" required />
              </label>
              <label>
                Amount
                <input
                  name="amount"
                  defaultValue={activeBooking ? parseAmount(activeBooking.amount) : ''}
                  min="1"
                  placeholder="450"
                  required
                  type="number"
                />
              </label>
              <label>
                Check in
                <input name="checkIn" defaultValue={activeBooking?.checkIn} required type="date" />
              </label>
              <label>
                Check out
                <input name="checkOut" defaultValue={activeBooking?.checkOut} required type="date" />
              </label>
              <label className="span-2">
                Status
                <select name="status" defaultValue={activeBooking?.status ?? 'Pending'}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <div className="admin-modal-actions span-2">
                <button className="ghost-button" type="button" onClick={closeBookingModal}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Icon name={activeBooking ? 'check' : 'plus'} />
                  {activeBooking ? 'Update Booking' : 'Save Booking'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
