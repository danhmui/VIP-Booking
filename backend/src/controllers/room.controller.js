import { z } from 'zod';
import {
  addRoom,
  editRoom,
  getRoom,
  listRooms,
  removeRoom,
} from '../services/room.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');

const roomStatusSchema = z.enum(['available', 'booked', 'occupied', 'maintenance']);

const roomSchema = z.object({
  room_number: z.string().trim().min(1, 'Vui lòng nhập số phòng'),
  floor: z.coerce.number().int().nonnegative('Tầng không hợp lệ'),
  status: roomStatusSchema,
  description: z.string().trim().optional().nullable(),
  image_url: z.string().trim().url('URL hình ảnh không hợp lệ').optional().nullable(),
  type_id: idSchema,
});

const updateRoomSchema = roomSchema.partial();

const querySchema = z.object({
  search: z.string().trim().optional(),
  status: roomStatusSchema.optional(),
  typeId: idSchema.optional(),
  floor: z.coerce.number().int().nonnegative().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export const index = async (req, res) => {
  try {
    const filters = querySchema.parse(req.query);
    const rooms = await listRooms(filters);

    return sendSuccess(res, {
      data: { rooms },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const roomId = idSchema.parse(req.params.id);
    const room = await getRoom(roomId);

    return sendSuccess(res, {
      data: { room },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const payload = roomSchema.parse(req.body);
    const room = await addRoom(payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo phòng thành công',
      data: { room },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const roomId = idSchema.parse(req.params.id);
    const payload = updateRoomSchema.parse(req.body);
    const room = await editRoom(roomId, payload);

    return sendSuccess(res, {
      message: 'Cập nhật phòng thành công',
      data: { room },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    const roomId = idSchema.parse(req.params.id);
    await removeRoom(roomId);

    return sendSuccess(res, {
      message: 'Xóa phòng thành công',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
