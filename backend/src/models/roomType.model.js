import prisma from '../config/db.js';

export const findRoomTypes = ({ search } = {}) => {
  return prisma.roomType.findMany({
    where: search
      ? {
          room_type_name: {
            contains: search,
          },
        }
      : undefined,
    orderBy: {
      room_type_id: 'desc',
    },
  });
};

export const findRoomTypeById = (roomTypeId) => {
  return prisma.roomType.findUnique({
    where: {
      room_type_id: BigInt(roomTypeId),
    },
    include: {
      _count: {
        select: {
          rooms: true,
        },
      },
    },
  });
};

export const createRoomType = (data) => {
  return prisma.roomType.create({
    data,
  });
};

export const updateRoomType = (roomTypeId, data) => {
  return prisma.roomType.update({
    where: {
      room_type_id: BigInt(roomTypeId),
    },
    data,
  });
};

export const deleteRoomType = (roomTypeId) => {
  return prisma.roomType.delete({
    where: {
      room_type_id: BigInt(roomTypeId),
    },
  });
};
