import type { Navigate, Room } from '../../types'
import { saveSelectedRoom } from '../../utils/bookingSelections'
import { formatCurrency } from '../../utils/currency'
import { useAuth } from '../../hooks/useAuth'
import { Icon } from '../icons/Icon'
import { useLocalizedRoom } from '../../utils/roomLocalization'

export function RoomCard({ room, navigate }: { room: Room; navigate: Navigate }) {
  const { isAuthenticated } = useAuth()
  const localizedRoom = useLocalizedRoom(room)
  const displayRating = room.rating.toFixed(1)

  const handleViewDetails = () => {
    saveSelectedRoom(room.id)
    navigate('roomDetail', { path: `rooms/${room.id}` })
  }

  const handleBook = () => {
    saveSelectedRoom(room.id)

    if (!isAuthenticated) {
      window.sessionStorage.setItem('vip-booking:pending-route', 'booking')
      navigate('login')
      return
    }

    navigate('booking')
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 shadow-[0_22px_48px_rgba(2,8,23,0.45)]">
      <button
        className="relative h-56 w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        type="button"
        aria-label={`View details for ${localizedRoom.name}`}
        onClick={handleViewDetails}
      >
        <img
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={room.image}
          alt={localizedRoom.name}
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-md border border-amber-300/35 bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-amber-300">
          {localizedRoom.category}
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="max-h-14 overflow-hidden text-lg font-semibold text-white">{localizedRoom.name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-300">
              <Icon name="mapPin" size={14} />
              {localizedRoom.location}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md bg-amber-300/15 px-2 py-1 text-sm font-semibold text-amber-300">
            <Icon name="star" size={14} />
            {displayRating}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="users" size={15} />
            {localizedRoom.guests}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Icon name="bed" size={15} />
            <span className="truncate">{localizedRoom.bed}</span>
          </span>
          <span>{room.size}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-slate-300">{localizedRoom.description}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2.5">
          <strong className="min-w-0 flex-1 basis-[140px] break-words text-lg font-semibold leading-tight text-white">
            {formatCurrency(room.price)}
            <small className="ml-1 whitespace-nowrap text-[11px] font-medium text-slate-400">/night</small>
          </strong>
          <div className="ml-auto flex shrink-0 gap-1.5">
            <button
              className="inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md border border-slate-600 bg-slate-800/70 px-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white"
              type="button"
              onClick={handleViewDetails}
            >
              Details
            </button>
            <button
              className="inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md bg-gradient-to-b from-blue-400 to-blue-600 px-2.5 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(37,99,235,0.35)] transition hover:brightness-110"
              type="button"
              onClick={handleBook}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
