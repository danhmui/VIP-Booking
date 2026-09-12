import { useEffect, useMemo, useState } from 'react'
import { fetchRooms } from '../api/vipBookingApi'
import { Icon } from '../components/icons/Icon'
import { FilterGroup } from '../components/rooms/FilterGroup'
import { RoomCard } from '../components/rooms/RoomCard'
import { PageIntro } from '../components/ui/PageIntro'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import type { Navigate, Room } from '../types'
import { getRoomSearchQuery, saveRoomSearchQuery } from '../utils/bookingSelections'

const priceOptions = [
  { value: 'under-1m', label: { en: 'Under 1,000,000 VND', vi: 'Dưới 1.000.000 VND' } },
  { value: 'between-1m-2m', label: { en: '1,000,000 - 2,000,000 VND', vi: '1.000.000 - 2.000.000 VND' } },
  { value: 'over-2m', label: { en: 'Over 2,000,000 VND', vi: 'Trên 2.000.000 VND' } },
] as const

const roomClassOptions = [
  { value: 'standard', label: { en: 'Standard', vi: 'Tiêu chuẩn' } },
  { value: 'superior', label: { en: 'Superior', vi: 'Cao cấp' } },
  { value: 'deluxe', label: { en: 'Deluxe', vi: 'Sang trọng' } },
  { value: 'suite', label: { en: 'Suite / VIP', vi: 'Suite / VIP' } },
] as const

const amenityOptions = [
  { value: 'balcony', label: { en: 'Balcony / Terrace', vi: 'Ban công / sân hiên' } },
  { value: 'city-view', label: { en: 'City / Street view', vi: 'Hướng nhìn thành phố / đường phố' } },
  { value: 'no-window', label: { en: 'No window', vi: 'Không có cửa sổ' } },
  { value: 'private-bathroom', label: { en: 'Private bathroom', vi: 'Phòng tắm riêng' } },
] as const

export function RoomListingPage({ navigate }: { navigate: Navigate }) {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedRoomClasses, setSelectedRoomClasses] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(() => getRoomSearchQuery())
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended')

  useEffect(() => {
    let isMounted = true

    fetchRooms()
      .then((nextRooms) => {
        if (!isMounted) return
        setRooms(nextRooms)
      })
      .catch((error) => {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Could not load rooms.'
        showToast({ title: 'Could not load rooms', message, variant: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [showToast])

  const toggleOption = (
    option: string,
    setItems: (value: string[] | ((previous: string[]) => string[])) => void,
  ) => {
    setItems((previous) =>
      previous.includes(option) ? previous.filter((item) => item !== option) : [...previous, option],
    )
  }

  const filteredRooms = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()
    const result = rooms.filter((room) => {
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

      const matchSearchQuery =
        normalizedSearchQuery.length === 0 || searchableText.includes(normalizedSearchQuery)

      const matchPrice =
        selectedPrices.length === 0 ||
        selectedPrices.some((price) => {
          if (price === 'under-1m') {
            return room.price < 1_000_000
          }
          if (price === 'between-1m-2m') {
            return room.price >= 1_000_000 && room.price <= 2_000_000
          }
          return room.price > 2_000_000
        })

      const roomInfo = `${room.category} ${room.name}`.toLowerCase()
      const matchRoomClass =
        selectedRoomClasses.length === 0 ||
        selectedRoomClasses.some((roomClass) => {
          if (roomClass === 'standard') {
            return roomInfo.includes('standard')
          }
          if (roomClass === 'superior') {
            return roomInfo.includes('superior')
          }
          if (roomClass === 'deluxe') {
            return roomInfo.includes('deluxe')
          }
          if (roomClass === 'suite') {
            return roomInfo.includes('suite') || roomInfo.includes('vip')
          }
          return false
        })

      const roomFeatures = [
        room.name,
        room.category,
        room.description,
        ...room.amenities,
        ...room.highlights,
      ]
        .join(' ')
        .toLowerCase()
      const matchAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) => {
          if (amenity === 'balcony') {
            return (
              roomFeatures.includes('balcony') ||
              roomFeatures.includes('terrace') ||
              roomFeatures.includes('ban công') ||
              roomFeatures.includes('sân hiên')
            )
          }
          if (amenity === 'city-view') {
            return (
              roomFeatures.includes('city view') ||
              roomFeatures.includes('street view') ||
              roomFeatures.includes('neighboring or street view') ||
              roomFeatures.includes('the window can see the whole city') ||
              roomFeatures.includes('hướng nhìn khu lân cận hoặc đường phố') ||
              roomFeatures.includes('cửa sổ nhìn bao quát toàn cảnh thành phố') ||
              roomFeatures.includes('đường phố hoặc mái nhà')
            )
          }
          if (amenity === 'no-window') {
            return roomFeatures.includes('no window') || roomFeatures.includes('không có cửa sổ')
          }
          return (
            roomFeatures.includes('separate toilet') ||
            roomFeatures.includes('private bathroom') ||
            roomFeatures.includes('toilet riêng') ||
            roomFeatures.includes('phòng tắm riêng')
          )
        })

      return matchSearchQuery && matchPrice && matchRoomClass && matchAmenities
    })

    if (sortBy === 'price-low') {
      return [...result].sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'price-high') {
      return [...result].sort((a, b) => b.price - a.price)
    }
    if (sortBy === 'rating') {
      return [...result].sort((a, b) => b.rating - a.rating)
    }
    return result
  }, [rooms, searchQuery, selectedAmenities, selectedPrices, selectedRoomClasses, sortBy])

  const sortLabels = {
    recommended: language === 'vi' ? 'Đề xuất' : 'Recommended',
    priceLow: language === 'vi' ? 'Giá: thấp đến cao' : 'Price: low to high',
    priceHigh: language === 'vi' ? 'Giá: cao đến thấp' : 'Price: high to low',
    rating: language === 'vi' ? 'Đánh giá cao nhất' : 'Highest rating',
  }

  return (
    <main className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <PageIntro
        eyebrow={language === 'vi' ? 'Danh sách phòng' : 'Room listing'}
        title={language === 'vi' ? 'Phòng hiện có' : 'Available Rooms'}
        copy={
          language === 'vi'
            ? 'Lọc phòng cao cấp theo hạng phòng, tiện ích, mức giá và số lượng khách.'
            : 'Filter premium room types by stay style, amenities, price and guest count.'
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className="grid gap-5 rounded-xl border border-slate-700 bg-slate-900/80 p-4 lg:sticky lg:top-24"
          aria-label={language === 'vi' ? 'Bộ lọc phòng' : 'Room filters'}
        >
          <div className="inline-flex items-center gap-2 text-lg font-semibold text-white">
            <Icon name="filter" size={18} />
            <span>{language === 'vi' ? 'Bộ lọc' : 'Filters'}</span>
          </div>
          <FilterGroup
            title={language === 'vi' ? 'Khoảng giá' : 'Price range'}
            options={priceOptions.map((option) => ({ value: option.value, label: option.label[language] }))}
            selectedOptions={selectedPrices}
            onToggle={(option) => toggleOption(option, setSelectedPrices)}
          />
          <FilterGroup
            title={language === 'vi' ? 'Hạng phòng' : 'Room class'}
            options={roomClassOptions.map((option) => ({ value: option.value, label: option.label[language] }))}
            selectedOptions={selectedRoomClasses}
            onToggle={(option) => toggleOption(option, setSelectedRoomClasses)}
          />
          <FilterGroup
            title={language === 'vi' ? 'Đặc điểm phòng' : 'Room features'}
            options={amenityOptions.map((option) => ({ value: option.value, label: option.label[language] }))}
            selectedOptions={selectedAmenities}
            onToggle={(option) => toggleOption(option, setSelectedAmenities)}
          />
        </aside>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/75 p-3">
            <div className="grid w-full gap-3 md:grid-cols-[minmax(220px,1fr)_auto] md:items-center">
              <div className="flex items-center gap-2">
                <input
                  className="h-10 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
                  value={searchQuery}
                  placeholder={
                    language === 'vi'
                      ? 'Tìm kiếm điểm đến, phòng hoặc tiện ích...'
                      : 'Search destination, room, or amenity...'
                  }
                  aria-label={language === 'vi' ? 'Tìm kiếm phòng' : 'Search rooms'}
                  onChange={(event) => {
                    const nextQuery = event.target.value
                    setSearchQuery(nextQuery)
                    saveRoomSearchQuery(nextQuery)
                  }}
                />
                {searchQuery.trim() && (
                  <button
                    className="ghost-button compact"
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      saveRoomSearchQuery('')
                    }}
                  >
                    {language === 'vi' ? 'Xóa' : 'Clear'}
                  </button>
                )}
              </div>

              <select
                className="h-10 min-w-[190px] rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
                value={sortBy}
                aria-label={language === 'vi' ? 'Sắp xếp phòng' : 'Sort rooms'}
                onChange={(event) =>
                  setSortBy(event.target.value as 'recommended' | 'price-low' | 'price-high' | 'rating')
                }
              >
                <option value="recommended">{sortLabels.recommended}</option>
                <option value="price-low">{sortLabels.priceLow}</option>
                <option value="price-high">{sortLabels.priceHigh}</option>
                <option value="rating">{sortLabels.rating}</option>
              </select>
            </div>

            <p className="w-full text-slate-300">
              <strong className="text-white">{filteredRooms.length}</strong>{' '}
              {language === 'vi' ? 'phòng được chọn lọc' : 'curated rooms found'}
            </p>
          </div>

          <div className="grid justify-start gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,360px))]">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} navigate={navigate} />
            ))}
          </div>
          {filteredRooms.length === 0 && (
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
              {language === 'vi'
                ? 'Không có phòng nào phù hợp với bộ lọc hiện tại. Hãy bỏ bớt một hoặc nhiều bộ lọc.'
                : 'No rooms match the current filter set. Try removing one or more filters.'}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
