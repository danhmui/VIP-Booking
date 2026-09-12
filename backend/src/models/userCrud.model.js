import prisma from '../config/db.js';
import { publicUserSelect } from './user.model.js';

export const findUsers = ({ search, status, roleId } = {}) => {
  return prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { email: { contains: search } },
              { full_name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(roleId ? { role_id: BigInt(roleId) } : {}),
    },
    select: publicUserSelect,
    orderBy: {
      user_id: 'desc',
    },
  });
};

export const findPublicUserByIdWithRole = (userId) => {
  return prisma.user.findUnique({
    where: {
      user_id: BigInt(userId),
    },
    select: publicUserSelect,
  });
};

export const createUserRecord = (data) => {
  return prisma.user.create({
    data,
    select: publicUserSelect,
  });
};

export const updateUserRecord = (userId, data) => {
  return prisma.user.update({
    where: {
      user_id: BigInt(userId),
    },
    data,
    select: publicUserSelect,
  });
};

export const deleteUserRecord = (userId) => {
  return prisma.user.delete({
    where: {
      user_id: BigInt(userId),
    },
  });
};
