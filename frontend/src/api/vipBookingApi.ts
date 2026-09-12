import { images } from '../data/images'
import type {
  BookingRecord,
  CheckInOutRecord,
  IconName,
  InvoiceRecord,
  PaymentRecord,
  RegisteredUser,
  Room,
  Service,
  ServiceUsageRecord,
} from '../types'
import { apiRequest, type AuthSession } from './httpClient'

type ApiEnvelope<TData> = {
  success: boolean
  message?: string
  data: TData
}

type WithApiMessage<T extends object> = T & {
  apiMessage: string
}

function attachApiMessage<T extends object>(
  value: T,
  response: ApiEnvelope<unknown>,
  fallbackMessage: string,
): WithApiMessage<T> {
  return {
    ...value,
    apiMessage: response.message || fallbackMessage,
  }
}

type ApiRole = {
  id?: string
  role_id?: string
  name?: string
  role_name?: string
  description?: string | null
}

type ApiUser = {
  id?: string
  user_id?: string
  email: string
  fullName?: string
  full_name?: string
  phone?: string | null
  status?: string
  role?: ApiRole | null
}

type ApiRoomType = {
  room_type_id: string
  room_type_name: string
  price: string
  capacity: number
  description?: string | null
}

type ApiRoom = {
  room_id: string
  room_number: string
  floor: number
  status: 'available' | 'booked' | 'occupied' | 'maintenance'
  description?: string | null
  image_url?: string | null
  type_id: string
  room_type?: ApiRoomType
}

type ApiService = {
  service_id: string
  service_name: string
  description?: string | null
  unit_price: string
  unit: string
  status: 'active' | 'inactive'
  duration?: number | null
}

type ApiBookingDetail = {
  room?: ApiRoom
  price_per_night?: string
  number_of_nights?: number
  subtotal?: string
}

type ApiBooking = {
  booking_id: string
  user_id: string
  booking_date?: string
  created_at?: string
  check_in_date: string
  check_out_date: string
  guest_count: number
  special_request?: string | null
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  user?: ApiUser
  details?: ApiBookingDetail[]
}

type ApiCheckInOut = {
  check_in_out_id: string
  booking_id: string
  room_id: string
  staff_id?: string
  check_in_time?: string
  check_out_time?: string | null
  status: CheckInOutRecord['status']
  note?: string | null
  room?: ApiRoom
  staff?: ApiUser
}

type ApiServiceUsage = {
  service_usage_id: string
  booking_id?: string | null
  service_id: string
  quantity: number
  unit_price: string
  subtotal: string
  used_at?: string
  note?: string | null
  service?: ApiService
}

type ApiInvoice = {
  invoice_id: string
  booking_id: string
  invoice_code: string
  issued_date?: string
  room_amount: string
  service_amount: string
  total_amount: string
  invoice_status: InvoiceRecord['status']
  note?: string | null
  booking?: ApiBooking & { user?: ApiUser }
}

type ApiPayment = {
  payment_id: string
  invoice_id: string
  amount: string
  payment_method: PaymentRecord['method']
  status: PaymentRecord['status']
  paid_at?: string
  invoice?: ApiInvoice
  staff?: ApiUser
}

const roomImages = [
  images.suiteGold,
  images.suiteMinimal,
  images.residenceClassic,
  images.suitePanoramic,
  images.penthouseNoir,
  images.ocean,
]

const serviceIcons: IconName[] = ['spark', 'shield', 'award', 'calendar', 'service']

function roleToFrontend(role?: ApiRole | null): RegisteredUser['role'] {
  return (role?.name ?? role?.role_name) === 'admin' ? 'admin' : 'guest'
}

function statusToBookingStatus(status: ApiBooking['status']): BookingRecord['status'] {
  if (status === 'confirmed' || status === 'checked_in' || status === 'checked_out') {
    return 'Confirmed'
  }

  if (status === 'cancelled') {
    return 'Cancelled'
  }

  return 'Pending'
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().slice(0, 10)
}

function mapApiUser(apiUser: ApiUser): AuthSession['user'] {
  return {
    id: apiUser.id ?? apiUser.user_id ?? '',
    email: apiUser.email,
    fullName: apiUser.fullName ?? apiUser.full_name ?? apiUser.email,
    phone: apiUser.phone ?? null,
    role: (apiUser.role?.name ?? apiUser.role?.role_name) === 'admin' ? 'admin' : 'customer',
  }
}

export function mapRoom(apiRoom: ApiRoom, index = 0): Room {
  const roomType = apiRoom.room_type
  const image = apiRoom.image_url || roomImages[index % roomImages.length]
  const price = Number(roomType?.price ?? 0)
  const capacity = Number(roomType?.capacity ?? 2)
  const roomTypeName = roomType?.room_type_name ?? ''
  const normalizedRoomTypeName = roomTypeName.toLowerCase()
  const rating =
    normalizedRoomTypeName.includes('suite') || normalizedRoomTypeName.includes('vip')
      ? 5
      : normalizedRoomTypeName.includes('superior') || normalizedRoomTypeName.includes('deluxe')
        ? 4.9
        : 4.8
  const statusLabel =
    apiRoom.status === 'available'
      ? 'Available now'
      : apiRoom.status === 'maintenance'
        ? 'Maintenance'
        : 'Limited availability'

  return {
    id: apiRoom.room_id,
    roomNumber: apiRoom.room_number,
    floor: apiRoom.floor,
    status: apiRoom.status,
    typeId: apiRoom.type_id,
    name: roomTypeName || `Room ${apiRoom.room_number}`,
    category: roomTypeName || 'Hotel Room',
    location: `Floor ${apiRoom.floor}, Room ${apiRoom.room_number}`,
    price,
    rating,
    reviews: 0,
    size: `${Math.max(capacity * 24, 36)} m2`,
    guests: `${capacity} guest${capacity > 1 ? 's' : ''}`,
    bed: capacity > 2 ? 'Family beds' : 'King bed',
    image,
    gallery: [image, images.lobby, images.dining],
    description: apiRoom.description || roomType?.description || statusLabel,
    amenities: ['High speed Wi-Fi', 'Smart climate control', 'Premium minibar', statusLabel],
    highlights: ['Database inventory', statusLabel, 'Admin managed'],
    availability: [4, 5, 10, 11, 12, 18, 19, 23, 24],
  }
}

export function mapService(apiService: ApiService, index = 0): Service {
  return {
    id: apiService.service_id,
    name: apiService.service_name,
    icon: serviceIcons[index % serviceIcons.length],
    price: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(apiService.unit_price)),
    note: apiService.description || `Unit: ${apiService.unit}`,
    status: apiService.status === 'active' ? 'Active' : 'Paused',
  }
}

export function mapBooking(apiBooking: ApiBooking): BookingRecord {
  const firstDetail = apiBooking.details?.[0]
  const roomName =
    firstDetail?.room?.room_type?.room_type_name ||
    (firstDetail?.room ? `Room ${firstDetail.room.room_number}` : 'Hotel room')
  const amount = Number(firstDetail?.subtotal ?? 0)

  return {
    id: apiBooking.booking_id,
    ownerEmail: apiBooking.user?.email,
    guest: apiBooking.user?.full_name ?? apiBooking.user?.fullName ?? apiBooking.user?.email ?? 'Guest',
    email: apiBooking.user?.email ?? '',
    room: roomName,
    bookingDate: apiBooking.booking_date ?? apiBooking.created_at ?? apiBooking.check_in_date,
    checkIn: formatDate(apiBooking.check_in_date),
    checkOut: formatDate(apiBooking.check_out_date),
    amount: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount),
    status: statusToBookingStatus(apiBooking.status),
  }
}

function formatCurrencyValue(value: string | number | null | undefined) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function mapCheckInOut(apiCheckInOut: ApiCheckInOut): CheckInOutRecord {
  return {
    id: apiCheckInOut.check_in_out_id,
    bookingId: apiCheckInOut.booking_id,
    roomId: apiCheckInOut.room_id,
    roomLabel: apiCheckInOut.room?.room_number
      ? `Room ${apiCheckInOut.room.room_number}`
      : `Room #${apiCheckInOut.room_id}`,
    staffName:
      apiCheckInOut.staff?.full_name ??
      apiCheckInOut.staff?.fullName ??
      apiCheckInOut.staff?.email ??
      'Admin',
    checkInTime: formatDateTime(apiCheckInOut.check_in_time),
    checkOutTime: formatDateTime(apiCheckInOut.check_out_time),
    status: apiCheckInOut.status,
    note: apiCheckInOut.note ?? '',
  }
}

function mapServiceUsage(apiUsage: ApiServiceUsage): ServiceUsageRecord {
  return {
    id: apiUsage.service_usage_id,
    bookingId: apiUsage.booking_id ?? '',
    serviceId: apiUsage.service_id,
    serviceName: apiUsage.service?.service_name ?? `Service #${apiUsage.service_id}`,
    quantity: apiUsage.quantity,
    unitPrice: formatCurrencyValue(apiUsage.unit_price),
    subtotal: formatCurrencyValue(apiUsage.subtotal),
    usedAt: formatDateTime(apiUsage.used_at),
    note: apiUsage.note ?? '',
  }
}

function mapInvoice(apiInvoice: ApiInvoice): InvoiceRecord {
  const user = apiInvoice.booking?.user
  return {
    id: apiInvoice.invoice_id,
    bookingId: apiInvoice.booking_id,
    code: apiInvoice.invoice_code,
    guest: user?.full_name ?? user?.fullName ?? user?.email ?? `Booking #${apiInvoice.booking_id}`,
    issuedDate: apiInvoice.issued_date ? formatDate(apiInvoice.issued_date) : '-',
    roomAmount: formatCurrencyValue(apiInvoice.room_amount),
    serviceAmount: formatCurrencyValue(apiInvoice.service_amount),
    totalAmount: formatCurrencyValue(apiInvoice.total_amount),
    status: apiInvoice.invoice_status,
    note: apiInvoice.note ?? '',
  }
}

function mapPayment(apiPayment: ApiPayment): PaymentRecord {
  return {
    id: apiPayment.payment_id,
    invoiceId: apiPayment.invoice_id,
    invoiceCode: apiPayment.invoice?.invoice_code ?? `Invoice #${apiPayment.invoice_id}`,
    amount: formatCurrencyValue(apiPayment.amount),
    method: apiPayment.payment_method,
    status: apiPayment.status,
    paidAt: formatDateTime(apiPayment.paid_at),
    staffName:
      apiPayment.staff?.full_name ??
      apiPayment.staff?.fullName ??
      apiPayment.staff?.email ??
      'Admin',
  }
}

export async function loginWithApi(email: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<ApiEnvelope<{ user: ApiUser; token: string }>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return {
    token: response.data.token,
    apiMessage: response.message,
    user: mapApiUser(response.data.user),
  }
}

export async function registerWithApi(payload: {
  email: string
  password: string
  fullName: string
  phone?: string
}): Promise<AuthSession> {
  const response = await apiRequest<ApiEnvelope<{ user: ApiUser; token: string }>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return {
    token: response.data.token,
    apiMessage: response.message,
    user: mapApiUser(response.data.user),
  }
}

export async function requestPasswordResetOtp(email: string): Promise<string> {
  const response = await apiRequest<ApiEnvelope<undefined>>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  return response.message || 'Verification code has been sent to your email.'
}

export async function verifyPasswordResetOtp(payload: {
  email: string
  code: string
}): Promise<string> {
  const response = await apiRequest<ApiEnvelope<undefined>>('/api/auth/verify-reset-code', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.message || 'Verification code is valid.'
}

export async function resetPasswordWithOtp(payload: {
  email: string
  code: string
  newPassword: string
}): Promise<string> {
  const response = await apiRequest<ApiEnvelope<undefined>>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.message || 'Password reset successfully.'
}

export async function getCurrentUser() {
  const response = await apiRequest<ApiEnvelope<{ user: ApiUser }>>('/api/auth/me')
  return mapApiUser(response.data.user)
}

export async function fetchRooms() {
  const response = await apiRequest<ApiEnvelope<{ rooms: ApiRoom[] }>>('/api/rooms')
  return response.data.rooms.map(mapRoom)
}

export async function fetchRoom(roomId: string) {
  const response = await apiRequest<ApiEnvelope<{ room: ApiRoom }>>(`/api/rooms/${roomId}`)
  return mapRoom(response.data.room)
}

export async function updateRoomWithApi(room: Room) {
  const response = await apiRequest<ApiEnvelope<{ room: ApiRoom }>>(`/api/rooms/${room.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      room_number: room.roomNumber || room.id,
      floor: room.floor ?? 0,
      status: room.status ?? 'available',
      description: room.description,
      image_url: room.image.startsWith('http') ? room.image : null,
      type_id: room.typeId,
    }),
  })

  return attachApiMessage(mapRoom(response.data.room), response, 'Room updated successfully.')
}

export async function deleteRoomWithApi(roomId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/rooms/${roomId}`, {
    method: 'DELETE',
  })
  return response.message || 'Room deleted successfully.'
}

export async function fetchServices() {
  const response = await apiRequest<ApiEnvelope<{ services: ApiService[] }>>('/api/services')
  return response.data.services.map(mapService)
}

export async function fetchBookings() {
  const response = await apiRequest<ApiEnvelope<{ bookings: ApiBooking[] }>>('/api/bookings')
  return response.data.bookings.map(mapBooking)
}

export async function createBooking(payload: {
  roomId: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  specialRequest?: string | null
}) {
  const response = await apiRequest<ApiEnvelope<{ booking: ApiBooking }>>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      check_in_date: payload.checkInDate,
      check_out_date: payload.checkOutDate,
      guest_count: payload.guestCount,
      special_request: payload.specialRequest || null,
      rooms: [{ room_id: payload.roomId }],
    }),
  })

  return attachApiMessage(mapBooking(response.data.booking), response, 'Booking created successfully.')
}

function bookingStatusToApi(status: BookingRecord['status']) {
  if (status === 'Confirmed') return 'confirmed'
  if (status === 'Cancelled') return 'cancelled'
  return 'pending'
}

export async function updateBookingWithApi(
  bookingId: string,
  payload: Partial<{
    checkInDate: string
    checkOutDate: string
    guestCount: number
    specialRequest: string | null
    status: BookingRecord['status']
  }>,
) {
  const body: Record<string, unknown> = {}
  if (payload.checkInDate) body.check_in_date = payload.checkInDate
  if (payload.checkOutDate) body.check_out_date = payload.checkOutDate
  if (payload.guestCount) body.guest_count = payload.guestCount
  if (payload.specialRequest !== undefined) body.special_request = payload.specialRequest
  if (payload.status) body.status = bookingStatusToApi(payload.status)

  const response = await apiRequest<ApiEnvelope<{ booking: ApiBooking }>>(`/api/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  return attachApiMessage(mapBooking(response.data.booking), response, 'Booking updated successfully.')
}

export async function deleteBookingWithApi(bookingId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
  })
  return response.message || 'Booking deleted successfully.'
}

export async function fetchUsers() {
  const response = await apiRequest<ApiEnvelope<{ users: ApiUser[] }>>('/api/users')

  return response.data.users.map((user) => ({
    id: user.id ?? user.user_id ?? '',
    email: user.email,
    password: '',
    role: roleToFrontend(user.role),
    fullName: user.fullName ?? user.full_name ?? user.email,
    phone: user.phone ?? null,
    status: user.status as RegisteredUser['status'],
    roleId: user.role?.id ?? user.role?.role_id ?? '',
  }))
}

export async function fetchRoles() {
  const response = await apiRequest<ApiEnvelope<{ roles: ApiRole[] }>>('/api/roles')
  return response.data.roles.map((role) => ({
    id: role.id ?? role.role_id ?? '',
    name: role.name ?? role.role_name ?? '',
  }))
}

export async function createUserWithApi(payload: {
  email: string
  password: string
  fullName: string
  phone?: string | null
  roleId: string
}) {
  const response = await apiRequest<ApiEnvelope<{ user: ApiUser }>>('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName,
      phone: payload.phone || null,
      status: 'active',
      role_id: payload.roleId,
    }),
  })

  return attachApiMessage({
    id: response.data.user.id ?? response.data.user.user_id ?? '',
    email: response.data.user.email,
    password: '',
    role: roleToFrontend(response.data.user.role),
    fullName: response.data.user.fullName ?? response.data.user.full_name ?? response.data.user.email,
    phone: response.data.user.phone ?? null,
    status: response.data.user.status as RegisteredUser['status'],
    roleId: response.data.user.role?.id ?? response.data.user.role?.role_id ?? '',
  }, response, 'User created successfully.')
}

export async function updateUserWithApi(
  userId: string,
  payload: Partial<{
    password: string
    fullName: string
    phone: string | null
    roleId: string
    status: RegisteredUser['status']
  }>,
) {
  const body: Record<string, unknown> = {}
  if (payload.password) body.password = payload.password
  if (payload.fullName) body.full_name = payload.fullName
  if (payload.phone !== undefined) body.phone = payload.phone
  if (payload.roleId) body.role_id = payload.roleId
  if (payload.status) body.status = payload.status

  const response = await apiRequest<ApiEnvelope<{ user: ApiUser }>>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  return attachApiMessage({
    id: response.data.user.id ?? response.data.user.user_id ?? '',
    email: response.data.user.email,
    password: '',
    role: roleToFrontend(response.data.user.role),
    fullName: response.data.user.fullName ?? response.data.user.full_name ?? response.data.user.email,
    phone: response.data.user.phone ?? null,
    status: response.data.user.status as RegisteredUser['status'],
    roleId: response.data.user.role?.id ?? response.data.user.role?.role_id ?? '',
  }, response, 'User updated successfully.')
}

export async function deleteUserWithApi(userId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/users/${userId}`, {
    method: 'DELETE',
  })
  return response.message || 'User deleted successfully.'
}

function serviceToPayload(service: Service) {
  return {
    service_name: service.name,
    description: service.note,
    unit_price: String(Number(service.price.replace(/[^0-9]/g, '')) || 0),
    unit: 'booking',
    status: service.status === 'Active' ? 'active' : 'inactive',
    duration: null,
  }
}

export async function createServiceWithApi(service: Service) {
  const response = await apiRequest<ApiEnvelope<{ service: ApiService }>>('/api/services', {
    method: 'POST',
    body: JSON.stringify(serviceToPayload(service)),
  })

  return attachApiMessage(mapService(response.data.service), response, 'Service created successfully.')
}

export async function updateServiceWithApi(serviceId: string, service: Service) {
  const response = await apiRequest<ApiEnvelope<{ service: ApiService }>>(`/api/services/${serviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(serviceToPayload(service)),
  })

  return attachApiMessage(mapService(response.data.service), response, 'Service updated successfully.')
}

export async function deleteServiceWithApi(serviceId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/services/${serviceId}`, {
    method: 'DELETE',
  })
  return response.message || 'Service deleted successfully.'
}

export async function fetchCheckInOuts() {
  const response = await apiRequest<ApiEnvelope<{ checkInOuts: ApiCheckInOut[] }>>('/api/check-in-out')
  return response.data.checkInOuts.map(mapCheckInOut)
}

export async function createCheckInOutWithApi(payload: {
  bookingId: string
  roomId: string
  staffId?: string
  checkInTime?: string
  checkOutTime?: string | null
  status: CheckInOutRecord['status']
  note?: string | null
}) {
  const response = await apiRequest<ApiEnvelope<{ checkInOut: ApiCheckInOut }>>('/api/check-in-out', {
    method: 'POST',
    body: JSON.stringify({
      booking_id: payload.bookingId,
      room_id: payload.roomId,
      staff_id: payload.staffId || undefined,
      check_in_time: payload.checkInTime || undefined,
      check_out_time: payload.checkOutTime || null,
      status: payload.status,
      note: payload.note || null,
    }),
  })

  return attachApiMessage(mapCheckInOut(response.data.checkInOut), response, 'Operation created successfully.')
}

export async function updateCheckInOutWithApi(
  recordId: string,
  payload: Partial<{
    roomId: string
    staffId: string
    checkInTime: string
    checkOutTime: string | null
    status: CheckInOutRecord['status']
    note: string | null
  }>,
) {
  const body: Record<string, unknown> = {}
  if (payload.roomId) body.room_id = payload.roomId
  if (payload.staffId) body.staff_id = payload.staffId
  if (payload.checkInTime) body.check_in_time = payload.checkInTime
  if (payload.checkOutTime !== undefined) body.check_out_time = payload.checkOutTime
  if (payload.status) body.status = payload.status
  if (payload.note !== undefined) body.note = payload.note

  const response = await apiRequest<ApiEnvelope<{ checkInOut: ApiCheckInOut }>>(
    `/api/check-in-out/${recordId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )

  return attachApiMessage(mapCheckInOut(response.data.checkInOut), response, 'Operation updated successfully.')
}

export async function deleteCheckInOutWithApi(recordId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/check-in-out/${recordId}`, {
    method: 'DELETE',
  })
  return response.message || 'Operation deleted successfully.'
}

export async function fetchServiceUsages() {
  const response = await apiRequest<ApiEnvelope<{ serviceUsages: ApiServiceUsage[] }>>('/api/service-usages')
  return response.data.serviceUsages.map(mapServiceUsage)
}

export async function createServiceUsageWithApi(payload: {
  bookingId?: string | null
  serviceId: string
  quantity: number
  unitPrice?: string
  usedAt?: string
  note?: string | null
}) {
  const response = await apiRequest<ApiEnvelope<{ serviceUsage: ApiServiceUsage }>>('/api/service-usages', {
    method: 'POST',
    body: JSON.stringify({
      booking_id: payload.bookingId || null,
      service_id: payload.serviceId,
      quantity: payload.quantity,
      unit_price: payload.unitPrice || undefined,
      used_at: payload.usedAt || undefined,
      note: payload.note || null,
    }),
  })

  return attachApiMessage(mapServiceUsage(response.data.serviceUsage), response, 'Service usage created successfully.')
}

export async function updateServiceUsageWithApi(
  usageId: string,
  payload: Partial<{
    bookingId: string | null
    serviceId: string
    quantity: number
    unitPrice: string
    usedAt: string
    note: string | null
  }>,
) {
  const body: Record<string, unknown> = {}
  if (payload.bookingId !== undefined) body.booking_id = payload.bookingId
  if (payload.serviceId) body.service_id = payload.serviceId
  if (payload.quantity) body.quantity = payload.quantity
  if (payload.unitPrice) body.unit_price = payload.unitPrice
  if (payload.usedAt) body.used_at = payload.usedAt
  if (payload.note !== undefined) body.note = payload.note

  const response = await apiRequest<ApiEnvelope<{ serviceUsage: ApiServiceUsage }>>(
    `/api/service-usages/${usageId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )

  return attachApiMessage(mapServiceUsage(response.data.serviceUsage), response, 'Service usage updated successfully.')
}

export async function deleteServiceUsageWithApi(usageId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/service-usages/${usageId}`, {
    method: 'DELETE',
  })
  return response.message || 'Service usage deleted successfully.'
}

export async function fetchInvoices() {
  const response = await apiRequest<ApiEnvelope<{ invoices: ApiInvoice[] }>>('/api/invoices')
  return response.data.invoices.map(mapInvoice)
}

export async function createInvoiceWithApi(payload: {
  bookingId: string
  invoiceCode?: string
  issuedDate?: string
  roomAmount?: string
  serviceAmount?: string
  surchargeAmount?: string
  discountAmount?: string
  taxAmount?: string
  status?: InvoiceRecord['status']
  note?: string | null
}) {
  const response = await apiRequest<ApiEnvelope<{ invoice: ApiInvoice }>>('/api/invoices', {
    method: 'POST',
    body: JSON.stringify({
      booking_id: payload.bookingId,
      invoice_code: payload.invoiceCode || undefined,
      issued_date: payload.issuedDate || undefined,
      room_amount: payload.roomAmount || undefined,
      service_amount: payload.serviceAmount || undefined,
      surcharge_amount: payload.surchargeAmount || undefined,
      discount_amount: payload.discountAmount || undefined,
      tax_amount: payload.taxAmount || undefined,
      invoice_status: payload.status || 'unpaid',
      note: payload.note || null,
    }),
  })

  return attachApiMessage(mapInvoice(response.data.invoice), response, 'Invoice created successfully.')
}

export async function updateInvoiceWithApi(
  invoiceId: string,
  payload: Partial<{
    status: InvoiceRecord['status']
    totalAmount: string
    surchargeAmount: string
    discountAmount: string
    taxAmount: string
    note: string | null
  }>,
) {
  const body: Record<string, unknown> = {}
  if (payload.status) body.invoice_status = payload.status
  if (payload.totalAmount) body.total_amount = payload.totalAmount
  if (payload.surchargeAmount) body.surcharge_amount = payload.surchargeAmount
  if (payload.discountAmount) body.discount_amount = payload.discountAmount
  if (payload.taxAmount) body.tax_amount = payload.taxAmount
  if (payload.note !== undefined) body.note = payload.note

  const response = await apiRequest<ApiEnvelope<{ invoice: ApiInvoice }>>(`/api/invoices/${invoiceId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  return attachApiMessage(mapInvoice(response.data.invoice), response, 'Invoice updated successfully.')
}

export async function deleteInvoiceWithApi(invoiceId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/invoices/${invoiceId}`, {
    method: 'DELETE',
  })
  return response.message || 'Invoice deleted successfully.'
}

export async function fetchPayments() {
  const response = await apiRequest<ApiEnvelope<{ payments: ApiPayment[] }>>('/api/payments')
  return response.data.payments.map(mapPayment)
}

export async function createPaymentWithApi(payload: {
  invoiceId: string
  amount: string
  method: PaymentRecord['method']
  status?: PaymentRecord['status']
  paidAt?: string
  staffId?: string
}) {
  const response = await apiRequest<ApiEnvelope<{ payment: ApiPayment }>>('/api/payments', {
    method: 'POST',
    body: JSON.stringify({
      invoice_id: payload.invoiceId,
      amount: payload.amount,
      payment_method: payload.method,
      status: payload.status || 'pending',
      paid_at: payload.paidAt || undefined,
      staff_id: payload.staffId || undefined,
    }),
  })

  return attachApiMessage(mapPayment(response.data.payment), response, 'Payment created successfully.')
}

type GatewayPaymentResponse = {
  payment: ApiPayment
  provider: 'vietqr'
  amount: number
  qrImageUrl?: string
  bank?: string
  account?: string
  accountName?: string
  transferContent?: string
  providerResponse?: unknown
}

function mapGatewayPayment(response: ApiEnvelope<GatewayPaymentResponse>) {
  return {
    ...response.data,
    payment: mapPayment(response.data.payment),
    apiMessage: response.message || 'Payment request created successfully.',
  }
}

export async function createVietQrPaymentWithApi(payload: {
  bookingId?: string
  invoiceId?: string
  amount?: string
}) {
  const response = await apiRequest<ApiEnvelope<GatewayPaymentResponse>>('/api/payments/vietqr/create', {
    method: 'POST',
    body: JSON.stringify({
      booking_id: payload.bookingId,
      invoice_id: payload.invoiceId,
      amount: payload.amount,
    }),
  })

  return mapGatewayPayment(response)
}

export async function verifyVietQrPaymentWithApi(paymentId: string) {
  const response = await apiRequest<ApiEnvelope<{ payment: ApiPayment }>>(
    `/api/payments/${paymentId}/verify-vietqr`,
    {
      method: 'POST',
    },
  )

  return attachApiMessage(mapPayment(response.data.payment), response, 'Payment status checked successfully.')
}

export async function updatePaymentWithApi(
  paymentId: string,
  payload: Partial<{
    amount: string
    method: PaymentRecord['method']
    status: PaymentRecord['status']
    paidAt: string
    staffId: string
  }>,
) {
  const body: Record<string, unknown> = {}
  if (payload.amount) body.amount = payload.amount
  if (payload.method) body.payment_method = payload.method
  if (payload.status) body.status = payload.status
  if (payload.paidAt) body.paid_at = payload.paidAt
  if (payload.staffId) body.staff_id = payload.staffId

  const response = await apiRequest<ApiEnvelope<{ payment: ApiPayment }>>(`/api/payments/${paymentId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  return attachApiMessage(mapPayment(response.data.payment), response, 'Payment updated successfully.')
}

export async function deletePaymentWithApi(paymentId: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/payments/${paymentId}`, {
    method: 'DELETE',
  })
  return response.message || 'Payment deleted successfully.'
}
