import { useEffect, useState } from 'react'
import { fetchRoom, fetchServices } from '../api/vipBookingApi'
import { BookingSummary } from '../components/booking/BookingSummary'
import { PriceDetails } from '../components/booking/PriceDetails'
import { Icon } from '../components/icons/Icon'
import { PageIntro } from '../components/ui/PageIntro'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { rooms as defaultRooms } from '../data/rooms'
import type { Navigate, Room, Service } from '../types'
import {
  formatStayRange,
  getSelectedAddOns,
  getSelectedRoomId,
  getSelectedStay,
  getStayNights,
  saveSelectedAddOns,
} from '../utils/bookingSelections'
import { formatCurrency } from '../utils/currency'
import { formatGuestLabel, useLocalizedRoom } from '../utils/roomLocalization'
import { useLocalizedServices } from '../utils/serviceLocalization'

function parseServicePrice(price: string) {
  // Keep only digits so formats like "120.000 ₫", "120,000 VND", or "$120"
  // are parsed consistently as full numeric amounts.
  return Number(price.replace(/[^0-9]/g, '')) || 0
}

export function ConfirmBookingPage({ navigate }: { navigate: Navigate }) {
  const { language, t } = useLanguage()
  const { showToast } = useToast()
  const [room, setRoom] = useState<Room>(defaultRooms[0])
  const [services, setServices] = useState<Service[]>([])
  const stay = getSelectedStay()
  const nights = getStayNights(stay)
  const selectedRoomId = getSelectedRoomId()
  const availableServices = services.filter((service) => service.status === 'Active')
  const localizedAvailableServices = useLocalizedServices(availableServices)
  const localizedRoom = useLocalizedRoom(room)
  const [selectedServices, setSelectedServices] = useState<string[]>(() => getSelectedAddOns().selectedServices)
  const addOnTotal = selectedServices.reduce((total, serviceName) => {
    const service = services.find((item) => item.name === serviceName)
    return total + (service ? parseServicePrice(service.price) : 0)
  }, 0)

  useEffect(() => {
    saveSelectedAddOns({ selectedServices, addOnTotal })
  }, [addOnTotal, selectedServices])

  useEffect(() => {
    if (!selectedRoomId) {
      const message = 'Please select a room before reviewing the booking.'
      showToast({ title: 'Room selection required', message, variant: 'warning' })
      return
    }

    let isMounted = true
    Promise.all([fetchRoom(selectedRoomId), fetchServices()])
      .then(([nextRoom, nextServices]) => {
        if (!isMounted) return
        setRoom(nextRoom)
        setServices(nextServices)
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Could not load booking review data.'
        showToast({ title: 'Could not load booking review', message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [selectedRoomId, showToast])

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Review booking"
        title="Confirm Your Booking"
        copy="Confirm the room, included services, add-ons, and final payment amount."
      />

      <div className="checkout-layout">
        <section className="form-panel">
          <h2>Room Summary</h2>
          <div className="summary-row strong">
            <span>{localizedRoom.name}</span>
            <strong>{formatCurrency(room.price * nights)}</strong>
          </div>
          <div className="mini-room">
            <img src={room.image} alt={localizedRoom.name} />
            <div>
              <p>{localizedRoom.location}</p>
              <span>{formatStayRange(stay)}</span>
              <span>{formatGuestLabel(stay.guests, language)}, {nights} {nights === 1 ? t('bookingSummary.night') : t('bookingSummary.nights')}</span>
            </div>
          </div>

          <h2>Additional Services</h2>
          <div className="add-on-grid">
            {availableServices.map((service, index) => {
              const localizedService = localizedAvailableServices[index] ?? service
              const isSelected = selectedServices.includes(service.name)

              return (
              <label className={`add-on-card ${isSelected ? 'selected' : ''}`} key={service.name}>
                <input
                  checked={isSelected}
                  type="checkbox"
                  onChange={(event) => {
                    setSelectedServices((current) =>
                      event.target.checked
                        ? [...current, service.name]
                        : current.filter((item) => item !== service.name),
                    )
                  }}
                />
                <span className="icon-tile">
                  <Icon name={service.icon} />
                </span>
                <strong>{localizedService.name}</strong>
                <small>{service.price}</small>
              </label>
              )
            })}
          </div>

          <h2>Price Details</h2>
          <PriceDetails room={room} addOnTotal={addOnTotal} nights={nights} />
          <button
            className="primary-button full-width"
            type="button"
            onClick={() => navigate('payment')}
          >
            Proceed to Payment
          </button>
        </section>
        <BookingSummary
          room={room}
          buttonLabel="Proceed to Payment"
          addOnTotal={addOnTotal}
          onButtonClick={() => navigate('payment')}
        />
      </div>
    </main>
  )
}
