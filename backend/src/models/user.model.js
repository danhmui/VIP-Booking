import prisma from '../config/db.js';

export const publicUserSelect = {
  user_id: true,
  email: true,
  full_name: true,
  phone: true,
  status: true,
  created_at: true,
  updated_at: true,
  role: {
    select: {
      role_id: true,
      role_name: true,
      description: true,
    },
  },
};

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserWithRoleByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });
};

export const findPublicUserById = (userId) => {
  return prisma.user.findUnique({
    where: {
      user_id: BigInt(userId),
    },
    select: publicUserSelect,
  });
};

export const createUser = (data) => {
  return prisma.user.create({
    data,
    select: publicUserSelect,
  });
};
