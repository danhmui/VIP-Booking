import { useEffect, useMemo, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { fetchBookings, fetchRooms, fetchServices, fetchUsers } from '../../api/vipBookingApi'
import { Icon } from '../../components/icons/Icon'
import { DataTable } from '../../components/ui/DataTable'
import { useToast } from '../../context/ToastContext'
import type { BookingRecord, IconName, RegisteredUser, Room, Service } from '../../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

function parseCurrencyAmount(value: string) {
  return Number(value.replace(/\D/g, '')) || 0
}

type ReservationFlowPoint = {
  label: string
  pending: number
  confirmed: number
  cancelled: number
  total: number
}

function formatChartDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value || 'Unknown'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function createReservationFlowData(bookings: BookingRecord[]): ReservationFlowPoint[] {
  const totals = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    total: 0,
  }

  return [...bookings]
    .sort((bookingA, bookingB) => {
      const dateA = new Date(bookingA.bookingDate || bookingA.checkIn).getTime()
      const dateB = new Date(bookingB.bookingDate || bookingB.checkIn).getTime()
      const safeDateA = Number.isNaN(dateA) ? Number.MAX_SAFE_INTEGER : dateA
      const safeDateB = Number.isNaN(dateB) ? Number.MAX_SAFE_INTEGER : dateB

      return safeDateA - safeDateB
    })
    .map((booking) => {
      const timestamp = booking.bookingDate || booking.checkIn

    if (booking.status === 'Confirmed') {
        totals.confirmed += 1
    } else if (booking.status === 'Cancelled') {
        totals.cancelled += 1
    } else {
        totals.pending += 1
    }

      totals.total += 1

      return {
        label: formatChartDate(timestamp),
        pending: totals.pending,
        confirmed: totals.confirmed,
        cancelled: totals.cancelled,
        total: totals.total,
      }
    })
}

export function AdminDashboardPage() {
  const { showToast } = useToast()
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    let isMounted = true

    Promise.all([fetchUsers(), fetchBookings(), fetchRooms(), fetchServices()])
      .then(([nextUsers, nextBookings, nextRooms, nextServices]) => {
        if (!isMounted) return
        setRegisteredUsers(nextUsers)
        setBookings(nextBookings)
        setRooms(nextRooms)
        setServices(nextServices)
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Could not load dashboard data.'
        showToast({ title: 'Could not load dashboard data', message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [showToast])

  const guestCount = registeredUsers.filter((user) => user.role === 'guest').length
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmed').length
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length
  const roomCount = rooms.length
  const activeServices = services.filter((service) => service.status === 'Active').length
  const bookingRevenue = bookings.reduce((total, booking) => {
    return total + parseCurrencyAmount(booking.amount)
  }, 0)
  const unpaidBookings = bookings.filter((booking) => booking.status === 'Pending').length
  const reservationFlowData = useMemo(() => createReservationFlowData(bookings), [bookings])
  const reservationFlowChartData = useMemo<ChartData<'line'>>(
    () => ({
      labels: reservationFlowData.map((point) => point.label),
      datasets: [
        {
          label: 'Confirmed',
          data: reservationFlowData.map((point) => point.confirmed),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.14)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.42,
          fill: true,
        },
        {
          label: 'Pending',
          data: reservationFlowData.map((point) => point.pending),
          borderColor: '#e4b96b',
          backgroundColor: 'rgba(228, 185, 107, 0.14)',
          pointBackgroundColor: '#e4b96b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.42,
          fill: true,
        },
        {
          label: 'Cancelled',
          data: reservationFlowData.map((point) => point.cancelled),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.42,
          fill: true,
        },
      ],
    }),
    [reservationFlowData],
  )
  const reservationFlowOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxHeight: 8,
            boxWidth: 8,
            color: '#94a3b8',
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 12,
              weight: 800,
            },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(10, 17, 32, 0.94)',
          borderColor: 'rgba(148, 163, 184, 0.24)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          padding: 12,
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
        },
      },
      scales: {
        x: {
          border: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: '#94a3b8',
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 11,
              weight: 800,
            },
          },
        },
        y: {
          beginAtZero: true,
          border: {
            display: false,
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.16)',
          },
          ticks: {
            precision: 0,
            color: '#94a3b8',
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 11,
              weight: 800,
            },
          },
        },
      },
    }),
    [],
  )
  const recentBookings =
    bookings.length > 0
      ? bookings.slice(0, 6).map((booking) => [
          booking.guest,
          booking.room,
          booking.checkIn,
          booking.amount,
          booking.status,
        ])
      : [['No bookings yet', '-', '-', '$0', 'Pending']]

  return (
    <div className="admin-stack">
      <div className="metric-grid">
        {[
          ['Revenue', `${bookingRevenue.toLocaleString('vi-VN')} VND`, `${bookings.length} bookings`, 'spark'],
          ['Check-in Queue', `${confirmedBookings}`, 'confirmed bookings', 'bed'],
          ['Unpaid Invoices', `${unpaidBookings}`, 'payment follow-up', 'card'],
          ['Guest Accounts', `${guestCount}`, 'registered guests', 'users'],
        ].map(([label, value, delta, icon]) => (
          <article className="metric-card" key={label}>
            <span className="icon-tile">
              <Icon name={icon as IconName} />
            </span>
            <p>{label}</p>
            <strong>{value}</strong>
            <small>{delta}</small>
          </article>
        ))}
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-title">
            <Icon name="dashboard" />
            <span>Reservation Flow</span>
          </div>
          <div className="chart" role="img" aria-label="Reservation flow by booking date">
            <Line data={reservationFlowChartData} options={reservationFlowOptions} />
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-title">
            <Icon name="bed" />
            <span>Operations Coverage</span>
          </div>
          <div className="grid gap-3">
            {[
              ['Rooms configured', roomCount, 'room inventory and type setup'],
              ['Active services', activeServices, 'hotel service catalog'],
              ['Pending bookings', pendingBookings, 'confirmation and check-in queue'],
            ].map(([label, value, note]) => (
              <div className="rounded-lg border border-slate-700 bg-slate-950/45 p-3" key={label}>
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <strong className="mt-1 block text-xl text-white">{value}</strong>
                <small className="text-slate-400">{note}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="panel-title">
          <Icon name="calendar" />
          <span>Recent Bookings</span>
        </div>
        <DataTable
          headers={['Guest', 'Room', 'Check in', 'Amount', 'Status']}
          rows={recentBookings}
        />
      </section>
    </div>
  )
}
