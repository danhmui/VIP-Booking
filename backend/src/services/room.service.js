import { findRoomTypeById } from '../models/roomType.model.js';
import {
  createRoom,
  deleteRoom,
  findRoomById,
  findRoomByNumber,
  findRooms,
  updateRoom,
} from '../models/room.model.js';
import { createHttpError } from '../utils/response.js';

const ensureRoomTypeExists = async (typeId) => {
  const roomType = await findRoomTypeById(typeId);

  if (!roomType) {
    throw createHttpError(400, 'Loại phòng không tồn tại');
  }
};

export const listRooms = (filters) => {
  return findRooms(filters);
};

export const getRoom = async (roomId) => {
  const room = await findRoomById(roomId);

  if (!room) {
    throw createHttpError(404, 'Không tìm thấy phòng');
  }

  return room;
};

export const addRoom = async (payload) => {
  await ensureRoomTypeExists(payload.type_id);

  const existingRoom = await findRoomByNumber(payload.room_number);

  if (existingRoom) {
    throw createHttpError(409, 'Số phòng đã tồn tại');
  }

  return createRoom({
    ...payload,
    type_id: BigInt(payload.type_id),
  });
};

export const editRoom = async (roomId, payload) => {
  await getRoom(roomId);

  if (payload.type_id) {
    await ensureRoomTypeExists(payload.type_id);
  }

  if (payload.room_number) {
    const existingRoom = await findRoomByNumber(payload.room_number);

    if (existingRoom && existingRoom.room_id !== BigInt(roomId)) {
      throw createHttpError(409, 'Số phòng đã tồn tại');
    }
  }

  return updateRoom(roomId, {
    ...payload,
    ...(payload.type_id ? { type_id: BigInt(payload.type_id) } : {}),
  });
};

export const removeRoom = async (roomId) => {
  await getRoom(roomId);
  await deleteRoom(roomId);
};
