import prisma from '../config/db.js';

export const findRoleByName = (roleName) => {
  return prisma.role.findFirst({
    where: {
      role_name: roleName,
    },
  });
};

export const createRole = (data) => {
  return prisma.role.create({
    data,
  });
};
