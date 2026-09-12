import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import type { Navigate } from '../../types'
import {
  type BookingStay,
  getRoomSearchQuery,
  saveRoomSearchQuery,
  saveSelectedStay,
} from '../../utils/bookingSelections'
import { formatGuestLabel } from '../../utils/roomLocalization'
import { Icon } from '../icons/Icon'

export type SearchPayload = BookingStay & {
  destination: string
}

export function SearchPanel({
  navigate,
  mode = 'navigate',
  onSearch,
}: {
  navigate: Navigate
  mode?: 'navigate' | 'inline'
  onSearch?: (payload: SearchPayload) => void
}) {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [destination, setDestination] = useState(() => getRoomSearchQuery() || 'Da Nang Oceanfront')
  const [checkIn, setCheckIn] = useState('2026-10-10')
  const [checkOut, setCheckOut] = useState('2026-10-13')
  const [guests, setGuests] = useState('2')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!destination.trim()) {
      const message = 'Please enter a destination.'
      showToast({ title: 'Destination is required', message, variant: 'error' })
      return
    }

    if (!checkIn || !checkOut) {
      const message = 'Please select check-in and check-out dates.'
      showToast({ title: 'Stay dates are required', message, variant: 'error' })
      return
    }

    const checkInDate = new Date(`${checkIn}T00:00:00`)
    const checkOutDate = new Date(`${checkOut}T00:00:00`)

    if (checkOutDate <= checkInDate) {
      const message = 'Check-out must be after check-in.'
      showToast({ title: 'Invalid stay dates', message, variant: 'error' })
      return
    }

    saveRoomSearchQuery(destination)
    saveSelectedStay({ checkIn, checkOut, guests })
    onSearch?.({
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests,
    })

    if (mode === 'navigate') {
      navigate('rooms')
    }
  }

  return (
    <form
      className="search-panel"
      onSubmit={handleSubmit}
    >
      <label>
        <span>Destination</span>
        <input value={destination} onChange={(event) => setDestination(event.target.value)} />
      </label>
      <label>
        <span>Check in</span>
        <input value={checkIn} type="date" onChange={(event) => setCheckIn(event.target.value)} />
      </label>
      <label>
        <span>Check out</span>
        <input value={checkOut} type="date" onChange={(event) => setCheckOut(event.target.value)} />
      </label>
      <label>
        <span>Guests</span>
        <select value={guests} onChange={(event) => setGuests(event.target.value)}>
          <option value="1">{formatGuestLabel('1', language)}</option>
          <option value="2">{formatGuestLabel('2', language)}</option>
          <option value="3">{formatGuestLabel('3', language)}</option>
          <option value="4">{formatGuestLabel('4', language)}</option>
        </select>
      </label>
      <button className="primary-button search-button" type="submit">
        <Icon name="search" />
        Search
      </button>
    </form>
  )
}
