import { z } from 'zod';
import {
  addRoomType,
  editRoomType,
  getRoomType,
  listRoomTypes,
  removeRoomType,
} from '../services/roomType.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');

const roomTypeSchema = z.object({
  room_type_name: z.string().trim().min(2, 'Tên loại phòng phải có ít nhất 2 ký tự'),
  price: z.union([z.string(), z.number()]).transform((value) => value.toString()),
  capacity: z.coerce.number().int().positive('Sức chứa phải lớn hơn 0'),
  description: z.string().trim().optional().nullable(),
});

const updateRoomTypeSchema = roomTypeSchema.partial();

const querySchema = z.object({
  search: z.string().trim().optional(),
});

export const index = async (req, res) => {
  try {
    const filters = querySchema.parse(req.query);
    const roomTypes = await listRoomTypes(filters);

    return sendSuccess(res, {
      data: { roomTypes },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const roomTypeId = idSchema.parse(req.params.id);
    const roomType = await getRoomType(roomTypeId);

    return sendSuccess(res, {
      data: { roomType },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const payload = roomTypeSchema.parse(req.body);
    const roomType = await addRoomType(payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo loại phòng thành công',
      data: { roomType },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const roomTypeId = idSchema.parse(req.params.id);
    const payload = updateRoomTypeSchema.parse(req.body);
    const roomType = await editRoomType(roomTypeId, payload);

    return sendSuccess(res, {
      message: 'Cập nhật loại phòng thành công',
      data: { roomType },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    const roomTypeId = idSchema.parse(req.params.id);
    await removeRoomType(roomTypeId);

    return sendSuccess(res, {
      message: 'Xóa loại phòng thành công',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
