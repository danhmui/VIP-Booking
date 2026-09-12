import prisma from '../config/db.js';

export const findServices = ({ search, status } = {}) => {
  return prisma.service.findMany({
    where: {
      ...(search
        ? {
            OR: [
              {
                service_name: {
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
    },
    orderBy: {
      service_id: 'desc',
    },
  });
};

export const findServiceById = (serviceId) => {
  return prisma.service.findUnique({
    where: {
      service_id: BigInt(serviceId),
    },
  });
};

export const createService = (data) => {
  return prisma.service.create({
    data,
  });
};

export const updateService = (serviceId, data) => {
  return prisma.service.update({
    where: {
      service_id: BigInt(serviceId),
    },
    data,
  });
};

export const deleteService = (serviceId) => {
  return prisma.service.delete({
    where: {
      service_id: BigInt(serviceId),
    },
  });
};
