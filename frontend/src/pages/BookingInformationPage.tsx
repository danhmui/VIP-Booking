import { useEffect, useState, type FormEvent } from 'react'
import { createBooking, fetchRoom } from '../api/vipBookingApi'
import { BookingSummary } from '../components/booking/BookingSummary'
import { PageIntro } from '../components/ui/PageIntro'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { rooms as defaultRooms } from '../data/rooms'
import { useAuth } from '../hooks/useAuth'
import type { Navigate, Room } from '../types'
import {
  getSelectedRoomId,
  getSelectedStay,
} from '../utils/bookingSelections'
import { setActiveBookingId } from '../utils/appStorage'

export function BookingInformationPage({ navigate }: { navigate: Navigate }) {
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [room, setRoom] = useState<Room>(defaultRooms[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const stay = getSelectedStay()
  const { user } = useAuth()
  const selectedRoomId = getSelectedRoomId()

  useEffect(() => {
    if (!selectedRoomId) {
      const message = t('bookingInfo.selectRoomMessage')
      showToast({ title: t('bookingInfo.selectRoomTitle'), message, variant: 'warning' })
      return
    }

    let isMounted = true
    fetchRoom(selectedRoomId)
      .then((nextRoom) => {
        if (!isMounted) return
        setRoom(nextRoom)
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : t('bookingInfo.couldNotLoadRoom')
        showToast({ title: t('bookingInfo.couldNotLoadRoomTitle'), message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [selectedRoomId, showToast, t])

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedRoomId) {
      const message = t('bookingInfo.selectRoomMessage')
      showToast({ title: t('bookingInfo.selectRoomTitle'), message, variant: 'warning' })
      return
    }

    const formData = new FormData(event.currentTarget)
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const email = String(formData.get('email') ?? user?.email ?? '').trim()
    const guestName = `${firstName} ${lastName}`.trim() || email || 'Guest'
    const specialRequest = String(formData.get('specialRequest') ?? '').trim()

    setIsSubmitting(true)

    try {
      const booking = await createBooking({
        roomId: selectedRoomId,
        checkInDate: stay.checkIn,
        checkOutDate: stay.checkOut,
        guestCount: Number.parseInt(stay.guests, 10) || 1,
        specialRequest: [guestName, specialRequest].filter(Boolean).join(' - '),
      })
      showToast({ title: t('bookingInfo.createdTitle'), message: booking.apiMessage, variant: 'success' })
      setActiveBookingId(booking.id)
      navigate('confirm')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('bookingInfo.createFailed')
      showToast({ title: t('bookingInfo.createFailedTitle'), message, variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow={t('bookingInfo.eyebrow')}
        title={t('bookingInfo.title')}
        copy={t('bookingInfo.copy')}
      />

      <form
        className="checkout-layout"
        onSubmit={handleBookingSubmit}
      >
        <section className="form-panel">
          <h2>{t('bookingInfo.guestDetails')}</h2>
          <div className="form-grid">
            <label>
              {t('bookingInfo.firstName')}
              <input defaultValue="Anh" name="firstName" />
            </label>
            <label>
              {t('bookingInfo.lastName')}
              <input defaultValue="Nguyen" name="lastName" />
            </label>
            <label className="span-2">
              {t('bookingInfo.emailAddress')}
              <input defaultValue={user?.email ?? 'guest@vipbooking.vn'} name="email" type="email" />
            </label>
            <label>
              {t('bookingInfo.phoneNumber')}
              <input defaultValue="+84 901 123 456" />
            </label>
            <label>
              {t('bookingInfo.arrivalTime')}
              <input defaultValue="15:00" type="time" />
            </label>
          </div>

          <h2>{t('bookingInfo.stayPreferences')}</h2>
          <textarea
            defaultValue={t('bookingInfo.preferencesDefault')}
            name="specialRequest"
            rows={5}
          />
          <label className="check-row consent-row">
            <input type="checkbox" />
            <span>{t('bookingInfo.accessible')}</span>
          </label>

          <button className="primary-button full-width" disabled={isSubmitting} type="submit">
            {isSubmitting ? t('bookingInfo.creating') : t('bookingInfo.continue')}
          </button>
        </section>

        <BookingSummary room={room} buttonLabel={t('bookingInfo.continue')} />
      </form>
    </main>
  )
}
