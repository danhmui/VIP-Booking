import { useEffect, useRef, useState, type FormEvent } from 'react'
import { fetchRoom } from '../api/vipBookingApi'
import { Icon } from '../components/icons/Icon'
import { PageIntro } from '../components/ui/PageIntro'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { rooms as defaultRooms } from '../data/rooms'
import { useAuth } from '../hooks/useAuth'
import type { Navigate, Room } from '../types'
import { formatGuestLabel, getGuestCount, useLocalizedRoom } from '../utils/roomLocalization'
import { defaultBookingStay, getSelectedStay, saveSelectedRoom } from '../utils/bookingSelections'
import { formatCurrency } from '../utils/currency'
import { getCurrentRoomSlug } from '../utils/router'

const minBookingDate = '2026-05-20'

function parseInputDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string) {
  if (!value) {
    return ''
  }

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function parseDisplayDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (!match) {
    return ''
  }

  const [, day, month, year] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  const isValidDate =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)

  return isValidDate ? formatInputDate(date) : ''
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getNightCount(checkInDate: Date | null, checkOutDate: Date | null) {
  if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
    return 0
  }

  return Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000)
}

function getMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = Array.from({ length: firstDay.getDay() }, () => null)
  const monthDays = Array.from(
    { length: daysInMonth },
    (_, index) => new Date(year, month, index + 1),
  )

  return [...leadingBlanks, ...monthDays]
}

export function RoomDetailPage({ navigate }: { navigate: Navigate }) {
  const { showToast } = useToast()
  const { language, t } = useLanguage()
  const [room, setRoom] = useState<Room>(defaultRooms[0])
  const selectedStay = getSelectedStay()
  const [checkIn, setCheckIn] = useState(selectedStay.checkIn || defaultBookingStay.checkIn)
  const [checkOut, setCheckOut] = useState(selectedStay.checkOut || defaultBookingStay.checkOut)
  const [checkInText, setCheckInText] = useState(() =>
    formatDisplayDate(selectedStay.checkIn || defaultBookingStay.checkIn),
  )
  const [checkOutText, setCheckOutText] = useState(() =>
    formatDisplayDate(selectedStay.checkOut || defaultBookingStay.checkOut),
  )
  const [guests, setGuests] = useState(() => getGuestCount(selectedStay.guests || room.guests))
  const [, setDateError] = useState('')
  const [visibleMonth, setVisibleMonth] = useState(() =>
    parseInputDate(selectedStay.checkIn || defaultBookingStay.checkIn),
  )
  const [activeDateField, setActiveDateField] = useState<'checkIn' | 'checkOut'>('checkIn')
  const checkInPickerRef = useRef<HTMLInputElement>(null)
  const checkOutPickerRef = useRef<HTMLInputElement>(null)
  const { isAuthenticated } = useAuth()
  const localizedRoom = useLocalizedRoom(room)
  const monthCells = getMonthCells(visibleMonth)
  const weekdayLabels = language === 'vi'
    ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthLabel = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)
  const selectedCheckIn = checkIn ? parseInputDate(checkIn) : null
  const selectedCheckOut = checkOut ? parseInputDate(checkOut) : null
  const selectedNights = getNightCount(selectedCheckIn, selectedCheckOut)

  useEffect(() => {
    let isMounted = true
    const roomId = getCurrentRoomSlug()

    if (!roomId) {
      const message = 'Room id is missing.'
      showToast({ title: 'Room is missing', message, variant: 'error' })
      return
    }

    if (!/^\d+$/.test(roomId)) {
      const staticRoom = defaultRooms.find((roomItem) => roomItem.id === roomId)

      if (staticRoom) {
        setRoom(staticRoom)
        setGuests((currentGuests) => currentGuests || getGuestCount(staticRoom.guests))
        return
      }
    }

    fetchRoom(roomId)
      .then((nextRoom) => {
        if (!isMounted) return
        setRoom(nextRoom)
        setGuests((currentGuests) => currentGuests || getGuestCount(nextRoom.guests))
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Could not load room details.'
        showToast({ title: 'Could not load room details', message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [showToast])

  const updateCheckIn = (value: string) => {
    setCheckIn(value)
    setCheckInText(formatDisplayDate(value))
    setDateError('')

    if (!value) {
      return
    }

    const nextCheckIn = parseInputDate(value)
    setVisibleMonth(nextCheckIn)

    if (checkOut && parseInputDate(checkOut) <= nextCheckIn) {
      const nextCheckOut = formatInputDate(addDays(nextCheckIn, 1))
      setCheckOut(nextCheckOut)
      setCheckOutText(formatDisplayDate(nextCheckOut))
    }
  }

  const updateCheckOut = (value: string) => {
    setCheckOut(value)
    setCheckOutText(formatDisplayDate(value))
    setDateError('')

    if (value) {
      setVisibleMonth(parseInputDate(value))
    }
  }

  const handleCalendarDateClick = (date: Date) => {
    const dateValue = formatInputDate(date)

    if (activeDateField === 'checkIn' || !selectedCheckIn) {
      updateCheckIn(dateValue)
      setCheckOut('')
      setCheckOutText('')
      setActiveDateField('checkOut')
      return
    }

    if (date <= selectedCheckIn) {
      const message = t('roomDetail.invalidDatesMessage')
      setDateError(message)
      showToast({ title: t('roomDetail.invalidDates'), message, variant: 'error' })
      return
    }

    updateCheckOut(dateValue)
  }

  const activateDateField = (field: 'checkIn' | 'checkOut') => {
    setActiveDateField(field)
    const selectedDate = field === 'checkIn' ? selectedCheckIn : selectedCheckOut || selectedCheckIn

    if (selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }

  const handleCheckInTextChange = (value: string) => {
    setCheckInText(value)
    setDateError('')
    const nextCheckIn = parseDisplayDate(value)

    if (!nextCheckIn) {
      setCheckIn('')
      return
    }

    updateCheckIn(nextCheckIn)
  }

  const handleCheckOutTextChange = (value: string) => {
    setCheckOutText(value)
    setDateError('')
    const nextCheckOut = parseDisplayDate(value)

    if (!nextCheckOut) {
      setCheckOut('')
      return
    }

    updateCheckOut(nextCheckOut)
  }

  const openNativePicker = (field: 'checkIn' | 'checkOut') => {
    activateDateField(field)
    const picker = field === 'checkIn' ? checkInPickerRef.current : checkOutPickerRef.current
    picker?.showPicker?.()
    picker?.focus()
  }

  const moveMonth = (offset: number) => {
    setVisibleMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth)
      nextMonth.setMonth(nextMonth.getMonth() + offset)
      return nextMonth
    })
  }

  const handleReserve = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!checkIn || !checkOut) {
      const message = t('roomDetail.missingDatesMessage')
      setDateError(message)
      showToast({ title: t('roomDetail.missingDates'), message, variant: 'error' })
      return
    }

    const checkInDate = new Date(`${checkIn}T00:00:00`)
    const checkOutDate = new Date(`${checkOut}T00:00:00`)

    if (checkOutDate <= checkInDate) {
      const message = t('roomDetail.invalidDatesMessage')
      setDateError(message)
      showToast({ title: t('roomDetail.invalidDates'), message, variant: 'error' })
      return
    }

    setDateError('')
    saveSelectedRoom(room.id, { checkIn, checkOut, guests })

    if (!isAuthenticated) {
      window.sessionStorage.setItem('vip-booking:pending-route', 'booking')
      navigate('login')
      return
    }

    navigate('booking')
  }

  return (
    <main className="page-shell room-detail-page">
      <PageIntro
        eyebrow={localizedRoom.category}
        title={localizedRoom.name}
        copy="A detailed room view with gallery, amenities, price summary, and availability picker."
      />

      <section className="detail-grid">
        <div>
          <div className="gallery-layout">
            <img className="gallery-main" src={room.gallery[0]} alt={localizedRoom.name} />
            <div className="gallery-side">
              {room.gallery.slice(1).map((image) => (
                <img src={image} alt={`${localizedRoom.name} preview`} key={image} loading="lazy" />
              ))}
            </div>
          </div>

          <div className="detail-panel">
            <div className="rating-line">
              <span>
                <Icon name="star" />
                {room.rating.toFixed(1)} rating
              </span>
              <span>{room.reviews} verified reviews</span>
              <span>{localizedRoom.location}</span>
            </div>
            <p>{localizedRoom.description}</p>
            <div className="amenity-grid">
              {localizedRoom.amenities.map((amenity) => (
                <span key={amenity}>
                  <Icon name={amenity.includes('Wi') ? 'wifi' : 'check'} size={15} />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-panel">
            <div className="panel-title">
              <Icon name="calendar" />
              <span>Availability</span>
            </div>
            <div className="calendar-card">
              <div className="calendar-header">
                <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>
                  <Icon name="chevron" />
                </button>
                <strong>{monthLabel}</strong>
                <button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>
                  <Icon name="chevron" />
                </button>
              </div>
              <div className="calendar-weekdays">
                {weekdayLabels.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {monthCells.map((date, index) => {
                  if (!date) {
                    return <span className="calendar-empty" key={`empty-${index}`} />
                  }

                  const dateValue = formatInputDate(date)
                  const isBeforeMinDate = date < parseInputDate(minBookingDate)
                  const isCheckIn = checkIn === dateValue
                  const isCheckOut = checkOut === dateValue
                  const isInRange =
                    selectedCheckIn !== null &&
                    selectedCheckOut !== null &&
                    date > selectedCheckIn &&
                    date < selectedCheckOut

                  return (
                    <button
                      className={`available ${isCheckIn || isCheckOut ? 'selected' : ''} ${
                        isInRange ? 'in-range' : ''
                      }`}
                      disabled={isBeforeMinDate}
                      key={dateValue}
                      type="button"
                      onClick={() => handleCalendarDateClick(date)}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <form className="booking-panel" onSubmit={handleReserve}>
          <div className="price-block">
            <span>Starting from</span>
            <strong>{formatCurrency(room.price)}</strong>
            <small>per night</small>
          </div>
          <div className="booking-fields">
            <label className={`date-field ${activeDateField === 'checkIn' ? 'active' : ''}`}>
              Check in
              <div className="date-input-row">
                <input
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={checkInText}
                  type="text"
                  onChange={(event) => handleCheckInTextChange(event.target.value)}
                  onFocus={() => activateDateField('checkIn')}
                />
                <button
                  className="calendar-picker-button"
                  type="button"
                  aria-label={t('roomDetail.chooseCheckInAria')}
                  onClick={() => openNativePicker('checkIn')}
                >
                  <Icon name="calendar" size={18} />
                </button>
                <input
                  ref={checkInPickerRef}
                  className="native-date-picker"
                  min={minBookingDate}
                  value={checkIn}
                  tabIndex={-1}
                  type="date"
                  onChange={(event) => updateCheckIn(event.target.value)}
                />
              </div>
            </label>
            <label className={`date-field ${activeDateField === 'checkOut' ? 'active' : ''}`}>
              Check out
              <div className="date-input-row">
                <input
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={checkOutText}
                  type="text"
                  onChange={(event) => handleCheckOutTextChange(event.target.value)}
                  onFocus={() => activateDateField('checkOut')}
                />
                <button
                  className="calendar-picker-button"
                  type="button"
                  aria-label={t('roomDetail.chooseCheckOutAria')}
                  onClick={() => openNativePicker('checkOut')}
                >
                  <Icon name="calendar" size={18} />
                </button>
                <input
                  ref={checkOutPickerRef}
                  className="native-date-picker"
                  min={checkIn ? formatInputDate(addDays(parseInputDate(checkIn), 1)) : minBookingDate}
                  value={checkOut}
                  tabIndex={-1}
                  type="date"
                  onChange={(event) => updateCheckOut(event.target.value)}
                />
              </div>
            </label>
            <label>
              Guests
              <select value={guests} onChange={(event) => setGuests(event.target.value)}>
                <option value="2">{formatGuestLabel('2', language)}</option>
                <option value="3">{formatGuestLabel('3', language)}</option>
                <option value="4">{formatGuestLabel('4', language)}</option>
              </select>
            </label>
          </div>
          <p className="stay-length">
            {selectedNights > 0
              ? t('roomDetail.staySelected', { nights: selectedNights })
              : activeDateField === 'checkIn'
                ? t('roomDetail.clickCheckIn')
                : t('roomDetail.clickCheckOut')}
          </p>
          <ul className="highlight-list">
            {localizedRoom.highlights.map((item) => (
              <li key={item}>
                <Icon name="check" />
                {item}
              </li>
            ))}
          </ul>
          <button
            className="primary-button full-width"
            type="submit"
          >
            Reserve Room
          </button>
        </form>
      </section>
    </main>
  )
}
