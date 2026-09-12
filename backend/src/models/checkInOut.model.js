import prisma from '../config/db.js';

const checkInOutInclude = {
  booking: true,
  room: true,
  staff: {
    select: {
      user_id: true,
      email: true,
      full_name: true,
      role: true,
    },
  },
};

export const findCheckInOuts = ({ bookingId, roomId, staffId, status } = {}) => {
  return prisma.checkInOut.findMany({
    where: {
      ...(bookingId ? { booking_id: BigInt(bookingId) } : {}),
      ...(roomId ? { room_id: BigInt(roomId) } : {}),
      ...(staffId ? { staff_id: BigInt(staffId) } : {}),
      ...(status ? { status } : {}),
    },
    include: checkInOutInclude,
    orderBy: {
      check_in_out_id: 'desc',
    },
  });
};

export const findCheckInOutById = (checkInOutId) => {
  return prisma.checkInOut.findUnique({
    where: {
      check_in_out_id: BigInt(checkInOutId),
    },
    include: checkInOutInclude,
  });
};

export const createCheckInOutRecord = (data) => {
  return prisma.checkInOut.create({
    data,
    include: checkInOutInclude,
  });
};

export const updateCheckInOutRecord = (checkInOutId, data) => {
  return prisma.checkInOut.update({
    where: {
      check_in_out_id: BigInt(checkInOutId),
    },
    data,
    include: checkInOutInclude,
  });
};

export const deleteCheckInOutRecord = (checkInOutId) => {
  return prisma.checkInOut.delete({
    where: {
      check_in_out_id: BigInt(checkInOutId),
    },
  });
};
