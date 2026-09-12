import { useEffect, useState } from 'react'
import { fetchRoom } from '../api/vipBookingApi'
import { PriceDetails } from '../components/booking/PriceDetails'
import { Icon } from '../components/icons/Icon'
import { useLanguage } from '../context/LanguageContext'
import { rooms as defaultRooms } from '../data/rooms'
import type { Navigate, Room } from '../types'
import { getSelectedAddOns, getSelectedRoomId, getSelectedStay, getStayNights } from '../utils/bookingSelections'
import {
  clearActiveBookingId,
  clearActivePaymentId,
  updateActiveBookingStatus,
} from '../utils/appStorage'
import { useLocalizedRoom } from '../utils/roomLocalization'

export function PaymentStatusPage({
  variant,
  navigate,
}: {
  variant: 'success' | 'failed'
  navigate: Navigate
}) {
  const isSuccess = variant === 'success'
  const { t } = useLanguage()
  const [room, setRoom] = useState<Room>(defaultRooms[0])
  const localizedRoom = useLocalizedRoom(room)
  const nights = getStayNights(getSelectedStay())
  const { addOnTotal } = getSelectedAddOns()

  useEffect(() => {
    const roomId = getSelectedRoomId()
    if (roomId) {
      fetchRoom(roomId).then(setRoom).catch(() => undefined)
    }

    if (isSuccess) {
      updateActiveBookingStatus('Confirmed')
      clearActivePaymentId()
      clearActiveBookingId()
      return
    }

    updateActiveBookingStatus('Pending')
  }, [isSuccess])

  return (
    <main className="status-page">
      <section className="status-panel">
        <span className={`status-icon ${isSuccess ? 'success' : 'failed'}`}>
          <Icon name={isSuccess ? 'check' : 'close'} size={28} />
        </span>
        <h1>{isSuccess ? t('paymentStatus.successTitle') : t('paymentStatus.failedTitle')}</h1>
        <p>
          {isSuccess
            ? t('paymentStatus.successMessage')
            : t('paymentStatus.failedMessage')}
        </p>
        <div className="receipt-card">
          <img src={room.image} alt={localizedRoom.name} />
          <div className="receipt-room-heading">
            <h2>{localizedRoom.name}</h2>
            <p>{localizedRoom.location}</p>
          </div>
          <PriceDetails room={room} nights={nights} addOnTotal={addOnTotal} />
        </div>
        <div className="status-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => navigate(isSuccess ? 'home' : 'payment')}
          >
            {isSuccess ? t('paymentStatus.backHome') : t('paymentStatus.tryAgain')}
          </button>
          <button className="ghost-button" type="button" onClick={() => navigate('rooms')}>
            {t('paymentStatus.viewRooms')}
          </button>
        </div>
      </section>
    </main>
  )
}
