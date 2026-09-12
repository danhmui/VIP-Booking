import {
  createRoomType,
  deleteRoomType,
  findRoomTypeById,
  findRoomTypes,
  updateRoomType,
} from '../models/roomType.model.js';
import { createHttpError } from '../utils/response.js';

export const listRoomTypes = (filters) => {
  return findRoomTypes(filters);
};

export const getRoomType = async (roomTypeId) => {
  const roomType = await findRoomTypeById(roomTypeId);

  if (!roomType) {
    throw createHttpError(404, 'Không tìm thấy loại phòng');
  }

  return roomType;
};

export const addRoomType = (payload) => {
  return createRoomType(payload);
};

export const editRoomType = async (roomTypeId, payload) => {
  await getRoomType(roomTypeId);
  return updateRoomType(roomTypeId, payload);
};

export const removeRoomType = async (roomTypeId) => {
  const roomType = await getRoomType(roomTypeId);

  if (roomType._count.rooms > 0) {
    throw createHttpError(409, 'Không thể xóa loại phòng đang có phòng sử dụng');
  }

  await deleteRoomType(roomTypeId);
};
