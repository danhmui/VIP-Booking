import prisma from '../config/db.js';

const roomInclude = {
  room_type: true,
};

export const findRooms = ({ search, status, typeId, floor, capacity } = {}) => {
  return prisma.room.findMany({
    where: {
      ...(search
        ? {
            OR: [
              {
                room_number: {
                  contains: search,
                },
              },
              {
                description: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(typeId ? { type_id: BigInt(typeId) } : {}),
      ...(floor ? { floor: Number(floor) } : {}),
      ...(capacity
        ? {
            room_type: {
              capacity: {
                gte: Number(capacity),
              },
            },
          }
        : {}),
    },
    include: roomInclude,
    orderBy: {
      room_id: 'desc',
    },
  });
};

export const findRoomById = (roomId) => {
  return prisma.room.findUnique({
    where: {
      room_id: BigInt(roomId),
    },
    include: roomInclude,
  });
};

export const findRoomByNumber = (roomNumber) => {
  return prisma.room.findUnique({
    where: {
      room_number: roomNumber,
    },
  });
};

export const createRoom = (data) => {
  return prisma.room.create({
    data,
    include: roomInclude,
  });
};

export const updateRoom = (roomId, data) => {
  return prisma.room.update({
    where: {
      room_id: BigInt(roomId),
    },
    data,
    include: roomInclude,
  });
};

export const deleteRoom = (roomId) => {
  return prisma.room.delete({
    where: {
      room_id: BigInt(roomId),
    },
  });
};
