import prisma from '../config/db.js';

export const findRoles = () => {
  return prisma.role.findMany({
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      role_id: 'asc',
    },
  });
};

export const findRoleById = (roleId) => {
  return prisma.role.findUnique({
    where: {
      role_id: BigInt(roleId),
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });
};

export const createRoleRecord = (data) => {
  return prisma.role.create({ data });
};

export const updateRoleRecord = (roleId, data) => {
  return prisma.role.update({
    where: {
      role_id: BigInt(roleId),
    },
    data,
  });
};

export const deleteRoleRecord = (roleId) => {
  return prisma.role.delete({
    where: {
      role_id: BigInt(roleId),
    },
  });
};
