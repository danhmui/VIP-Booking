import { findRoomById } from '../models/room.model.js';
import {
  createBookingRecord,
  deleteBookingRecord,
  findBookingById,
  findBookings,
  updateBookingRecord,
} from '../models/booking.model.js';
import { createHttpError } from '../utils/response.js';

const dayInMs = 24 * 60 * 60 * 1000;

const calculateNights = (checkInDate, checkOutDate) => {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const nights = Math.ceil((end.getTime() - start.getTime()) / dayInMs);

  if (!Number.isFinite(nights) || nights <= 0) {
    throw createHttpError(400, 'Ngày trả phòng phải sau ngày nhận phòng');
  }

  return nights;
};

const canAccessBooking = (booking, actor) => {
  return actor.role === 'admin' || booking.user_id === BigInt(actor.id);
};

export const listBookings = async (filters, actor) => {
  const scopedFilters = actor.role === 'admin'
    ? filters
    : { ...filters, userId: actor.id };

  return findBookings(scopedFilters);
};

export const getBooking = async (bookingId, actor) => {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw createHttpError(404, 'Không tìm thấy đặt phòng');
  }

  if (!canAccessBooking(booking, actor)) {
    throw createHttpError(403, 'Bạn không có quyền xem đặt phòng này');
  }

  return booking;
};

export const addBooking = async (payload, actor) => {
  const nights = calculateNights(payload.check_in_date, payload.check_out_date);
  const userId = actor.role === 'admin' && payload.user_id ? payload.user_id : actor.id;
  const details = [];

  for (const item of payload.rooms) {
    const room = await findRoomById(item.room_id);

    if (!room) {
      throw createHttpError(400, `Phòng ${item.room_id} không tồn tại`);
    }

    const pricePerNight = item.price_per_night?.toString() || room.room_type.price.toString();
    const numberOfNights = item.number_of_nights || nights;

    details.push({
      room_id: BigInt(item.room_id),
      price_per_night: pricePerNight,
      number_of_nights: numberOfNights,
      subtotal: (Number(pricePerNight) * numberOfNights).toFixed(2),
      note: item.note || null,
    });
  }

  return createBookingRecord(
    {
      user_id: BigInt(userId),
      check_in_date: new Date(payload.check_in_date),
      check_out_date: new Date(payload.check_out_date),
      guest_count: payload.guest_count,
      special_request: payload.special_request || null,
      status: payload.status || 'pending',
    },
    details,
  );
};

export const editBooking = async (bookingId, payload, actor) => {
  await getBooking(bookingId, actor);

  return updateBookingRecord(bookingId, {
    ...(payload.check_in_date ? { check_in_date: new Date(payload.check_in_date) } : {}),
    ...(payload.check_out_date ? { check_out_date: new Date(payload.check_out_date) } : {}),
    ...(payload.guest_count ? { guest_count: payload.guest_count } : {}),
    ...(payload.special_request !== undefined
      ? { special_request: payload.special_request || null }
      : {}),
    ...(payload.status ? { status: payload.status } : {}),
    updated_at: new Date(),
  });
};

export const removeBooking = async (bookingId, actor) => {
  await getBooking(bookingId, actor);
  await deleteBookingRecord(bookingId);
};
