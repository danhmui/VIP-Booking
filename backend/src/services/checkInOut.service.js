import { findBookingById } from '../models/booking.model.js';
import {
  createCheckInOutRecord,
  deleteCheckInOutRecord,
  findCheckInOutById,
  findCheckInOuts,
  updateCheckInOutRecord,
} from '../models/checkInOut.model.js';
import { findRoomById } from '../models/room.model.js';
import { findPublicUserById } from '../models/user.model.js';
import { createHttpError } from '../utils/response.js';

const ensureAdminUser = async (userId) => {
  const user = await findPublicUserById(userId);

  if (!user || user.role?.role_name !== 'admin') {
    throw createHttpError(400, 'Nguoi thuc hien phai la admin');
  }
};

export const listCheckInOuts = (filters) => {
  return findCheckInOuts(filters);
};

export const getCheckInOut = async (checkInOutId) => {
  const checkInOut = await findCheckInOutById(checkInOutId);

  if (!checkInOut) {
    throw createHttpError(404, 'Khong tim thay ban ghi check-in/check-out');
  }

  return checkInOut;
};

export const addCheckInOut = async (payload, actor) => {
  const booking = await findBookingById(payload.booking_id);

  if (!booking) {
    throw createHttpError(400, 'Dat phong khong ton tai');
  }

  const room = await findRoomById(payload.room_id);

  if (!room) {
    throw createHttpError(400, 'Phong khong ton tai');
  }

  const staffId = payload.staff_id || actor.id;
  await ensureAdminUser(staffId);

  return createCheckInOutRecord({
    booking_id: BigInt(payload.booking_id),
    room_id: BigInt(payload.room_id),
    staff_id: BigInt(staffId),
    check_in_time: payload.check_in_time ? new Date(payload.check_in_time) : new Date(),
    check_out_time: payload.check_out_time ? new Date(payload.check_out_time) : null,
    status: payload.status,
    note: payload.note || null,
  });
};

export const editCheckInOut = async (checkInOutId, payload) => {
  await getCheckInOut(checkInOutId);

  if (payload.staff_id) {
    await ensureAdminUser(payload.staff_id);
  }

  return updateCheckInOutRecord(checkInOutId, {
    ...(payload.room_id ? { room_id: BigInt(payload.room_id) } : {}),
    ...(payload.staff_id ? { staff_id: BigInt(payload.staff_id) } : {}),
    ...(payload.check_in_time ? { check_in_time: new Date(payload.check_in_time) } : {}),
    ...(payload.check_out_time ? { check_out_time: new Date(payload.check_out_time) } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.note !== undefined ? { note: payload.note || null } : {}),
  });
};

export const removeCheckInOut = async (checkInOutId) => {
  await getCheckInOut(checkInOutId);
  await deleteCheckInOutRecord(checkInOutId);
};
