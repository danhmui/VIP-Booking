import { useEffect, useMemo, useState } from 'react'
import { fetchRooms, fetchServices } from '../api/vipBookingApi'
import { SearchPanel, type SearchPayload } from '../components/search/SearchPanel'
import { Icon } from '../components/icons/Icon'
import { RoomCard } from '../components/rooms/RoomCard'
import { SectionHeading } from '../components/ui/SectionHeading'
import { useToast } from '../context/ToastContext'
import { images } from '../data/images'
import { useAuth } from '../hooks/useAuth'
import type { Navigate, Room, Service } from '../types'
import { useLocalizedServices } from '../utils/serviceLocalization'

export function HomePage({ navigate }: { navigate: Navigate }) {
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [services, setServices] = useState<Service[]>([])
  const localizedServices = useLocalizedServices(services)
  const [homeSearchTerm, setHomeSearchTerm] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    let isMounted = true

    Promise.all([fetchRooms(), fetchServices()])
      .then(([nextRooms, nextServices]) => {
        if (!isMounted) return
        setRooms(nextRooms)
        setServices(nextServices.filter((service) => service.status === 'Active'))
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Could not load booking data.'
        showToast({ title: 'Could not load booking data', message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [showToast])

  const handleStartBooking = () => {
    if (!isAuthenticated) {
      window.sessionStorage.setItem('vip-booking:pending-route', 'booking')
      navigate('login')
      return
    }

    navigate('booking')
  }

  const handleHomeSearch = (payload: SearchPayload) => {
    setHomeSearchTerm(payload.destination.trim().toLowerCase())
    setHasSearched(true)
  }

  const featuredRooms = useMemo(() => {
    if (!homeSearchTerm) {
      return rooms
    }

    return rooms.filter((room) => {
      const searchableText = [
        room.name,
        room.category,
        room.location,
        room.description,
        ...room.amenities,
        ...room.highlights,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(homeSearchTerm)
    })
  }, [homeSearchTerm, rooms])

  const featuredTitle = hasSearched ? 'Search results on home' : 'Rooms built for premium travel'
  const featuredEyebrow = hasSearched ? 'Home search' : 'Featured stays'
  const featuredActionLabel = hasSearched ? 'View all rooms' : 'View all'

  return (
    <main className="home-page">
      <section className="hero-section" style={{ backgroundImage: `url(${images.hero})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">VIP hospitality platform</p>
          <h1>Experience Unparalleled Luxury</h1>
          <p>
            Reserve refined rooms, add personal services, and move from search to secure payment
            with the same polished flow shown in the VIP Booking demo.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => navigate('rooms')}>
              Explore Rooms
            </button>
            <button className="secondary-button" type="button" onClick={() => navigate('contact')}>
              Concierge
            </button>
          </div>
        </div>
        <SearchPanel mode="inline" navigate={navigate} onSearch={handleHomeSearch} />
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow={featuredEyebrow}
          title={featuredTitle}
          actionLabel={featuredActionLabel}
          onAction={() => navigate('rooms')}
        />
        {hasSearched && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm">
            <p className="text-slate-300">
              Found <strong className="text-white">{featuredRooms.length}</strong> room(s) matching your search.
            </p>
            <button
              className="ghost-button compact"
              type="button"
              onClick={() => {
                setHomeSearchTerm('')
                setHasSearched(false)
              }}
            >
              Clear search
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredRooms.map((room) => (
            <RoomCard key={room.id} room={room} navigate={navigate} />
          ))}
        </div>
        {hasSearched && featuredRooms.length === 0 && (
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
            No rooms matched this destination. Try another keyword or view all rooms.
          </p>
        )}
      </section>

      <section className="section-shell service-band">
        <SectionHeading eyebrow="Services" title="World-class amenities" />
        <div className="service-grid">
          {localizedServices.slice(0, 4).map((service) => (
            <article className="service-card" key={service.name}>
              <span className="icon-tile">
                <Icon name={service.icon} />
              </span>
              <h3>{service.name}</h3>
              <p>{service.note}</p>
              <span>{service.price}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell split-story">
        <div>
          <p className="eyebrow">Weekend retreat</p>
          <h2>Private dining, skyline rooms, and arrival support in one flow.</h2>
          <p>
            The interface keeps the guest journey visible: select a room, confirm service add-ons,
            review the invoice, and pay without losing booking context.
          </p>
          <button className="secondary-button" type="button" onClick={handleStartBooking}>
            Start Booking
          </button>
        </div>
        <img src={images.dining} alt="Luxury dinner setting" loading="lazy" />
      </section>
    </main>
  )
}
