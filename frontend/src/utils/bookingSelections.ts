const selectedRoomKey = 'vip-booking:selected-room-id'
const selectedStayKey = 'vip-booking:selected-stay'
const roomSearchQueryKey = 'vip-booking:room-search-query'
const selectedAddOnsKey = 'vip-booking:selected-add-ons'

export type BookingStay = {
  checkIn: string
  checkOut: string
  guests: string
}

export type BookingAddOns = {
  selectedServices: string[]
  addOnTotal: number
}

export const defaultBookingStay: BookingStay = {
  checkIn: '2026-10-10',
  checkOut: '2026-10-13',
  guests: '2',
}

function normalizeGuestCount(value: string | number | null | undefined) {
  const matchedValue = String(value ?? '').match(/\d+/)
  return matchedValue?.[0] ?? defaultBookingStay.guests
}

function parseStayDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

export function getStayNights(stay: BookingStay = getSelectedStay()) {
  const checkIn = parseStayDate(stay.checkIn)
  const checkOut = parseStayDate(stay.checkOut)
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000)

  return Math.max(nights, 1)
}

export function formatStayRange(stay: BookingStay = getSelectedStay()) {
  const formatter = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${formatter.format(parseStayDate(stay.checkIn))} - ${formatter.format(
    parseStayDate(stay.checkOut),
  )}`
}

export function saveSelectedStay(stay: BookingStay) {
  window.sessionStorage.setItem(
    selectedStayKey,
    JSON.stringify({
      ...stay,
      guests: normalizeGuestCount(stay.guests),
    }),
  )
}

export function saveSelectedRoom(roomId: string, stay: BookingStay = getSelectedStay()) {
  window.sessionStorage.setItem(selectedRoomKey, roomId)
  saveSelectedStay(stay)
}

export function getSelectedRoomId() {
  return window.sessionStorage.getItem(selectedRoomKey) ?? ''
}

export function saveRoomSearchQuery(query: string) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    window.sessionStorage.removeItem(roomSearchQueryKey)
    return
  }

  window.sessionStorage.setItem(roomSearchQueryKey, trimmedQuery)
}

export function getRoomSearchQuery() {
  return window.sessionStorage.getItem(roomSearchQueryKey) ?? ''
}

export function getSelectedStay(): BookingStay {
  const rawStay = window.sessionStorage.getItem(selectedStayKey)

  if (!rawStay) {
    return defaultBookingStay
  }

  try {
    const parsedStay = { ...defaultBookingStay, ...(JSON.parse(rawStay) as Partial<BookingStay>) }
    return {
      ...parsedStay,
      guests: normalizeGuestCount(parsedStay.guests),
    }
  } catch {
    window.sessionStorage.removeItem(selectedStayKey)
    return defaultBookingStay
  }
}

export function saveSelectedAddOns(addOns: BookingAddOns) {
  window.sessionStorage.setItem(selectedAddOnsKey, JSON.stringify(addOns))
}

export function getSelectedAddOns(): BookingAddOns {
  const rawAddOns = window.sessionStorage.getItem(selectedAddOnsKey)

  if (!rawAddOns) {
    return { selectedServices: [], addOnTotal: 0 }
  }

  try {
    const parsedAddOns = JSON.parse(rawAddOns) as Partial<BookingAddOns>
    const selectedServices = Array.isArray(parsedAddOns.selectedServices)
      ? parsedAddOns.selectedServices.filter((item): item is string => typeof item === 'string')
      : []
    const addOnTotal = Number(parsedAddOns.addOnTotal ?? 0)

    return {
      selectedServices,
      addOnTotal: Number.isFinite(addOnTotal) ? Math.max(0, addOnTotal) : 0,
    }
  } catch {
    window.sessionStorage.removeItem(selectedAddOnsKey)
    return { selectedServices: [], addOnTotal: 0 }
  }
}

export function clearSelectedAddOns() {
  window.sessionStorage.removeItem(selectedAddOnsKey)
}
