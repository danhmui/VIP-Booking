import { z } from 'zod';
import {
  addCheckInOut,
  editCheckInOut,
  getCheckInOut,
  listCheckInOuts,
  removeCheckInOut,
} from '../services/checkInOut.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');
const statusSchema = z.enum(['checked_in', 'checked_out']);
const schema = z.object({
  booking_id: idSchema,
  room_id: idSchema,
  staff_id: idSchema.optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional().nullable(),
  status: statusSchema,
  note: z.string().trim().optional().nullable(),
});
const updateSchema = schema.partial();
const querySchema = z.object({
  bookingId: idSchema.optional(),
  roomId: idSchema.optional(),
  staffId: idSchema.optional(),
  status: statusSchema.optional(),
});

export const index = async (req, res) => {
  try {
    const checkInOuts = await listCheckInOuts(querySchema.parse(req.query));
    return sendSuccess(res, { data: { checkInOuts } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const checkInOut = await getCheckInOut(idSchema.parse(req.params.id));
    return sendSuccess(res, { data: { checkInOut } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const checkInOut = await addCheckInOut(schema.parse(req.body), req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo check-in/check-out thành công',
      data: { checkInOut },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const checkInOut = await editCheckInOut(idSchema.parse(req.params.id), updateSchema.parse(req.body));
    return sendSuccess(res, {
      message: 'Cập nhật check-in/check-out thành công',
      data: { checkInOut },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removeCheckInOut(idSchema.parse(req.params.id));
    return sendSuccess(res, { message: 'Xóa check-in/check-out thành công' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
