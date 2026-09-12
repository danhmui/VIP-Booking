import { z } from 'zod';
import {
  addBooking,
  editBooking,
  getBooking,
  listBookings,
  removeBooking,
} from '../services/booking.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');
const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]);

const bookingRoomSchema = z.object({
  room_id: idSchema,
  price_per_night: z.union([z.string(), z.number()]).optional(),
  number_of_nights: z.coerce.number().int().positive().optional(),
  note: z.string().trim().optional().nullable(),
});

const bookingSchema = z.object({
  user_id: idSchema.optional(),
  check_in_date: z.string().min(1, 'Vui lòng nhập ngày nhận phòng'),
  check_out_date: z.string().min(1, 'Vui lòng nhập ngày trả phòng'),
  guest_count: z.coerce.number().int().positive('Số khách phải lớn hơn 0'),
  special_request: z.string().trim().optional().nullable(),
  status: bookingStatusSchema.optional(),
  rooms: z.array(bookingRoomSchema).min(1, 'Cần chọn ít nhất 1 phòng'),
});

const updateBookingSchema = bookingSchema.omit({ rooms: true }).partial();
const querySchema = z.object({
  userId: idSchema.optional(),
  status: bookingStatusSchema.optional(),
});

export const index = async (req, res) => {
  try {
    const bookings = await listBookings(querySchema.parse(req.query), req.user);
    return sendSuccess(res, { data: { bookings } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const booking = await getBooking(idSchema.parse(req.params.id), req.user);
    return sendSuccess(res, { data: { booking } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const booking = await addBooking(bookingSchema.parse(req.body), req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo đặt phòng thành công',
      data: { booking },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const payload = updateBookingSchema.parse(req.body);

    if (req.user.role !== 'admin') {
      delete payload.status;
    }

    const booking = await editBooking(
      idSchema.parse(req.params.id),
      payload,
      req.user,
    );
    return sendSuccess(res, {
      message: 'Cập nhật đặt phòng thành công',
      data: { booking },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removeBooking(idSchema.parse(req.params.id), req.user);
    return sendSuccess(res, { message: 'Xóa đặt phòng thành công' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
