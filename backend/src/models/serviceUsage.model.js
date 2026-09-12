import prisma from '../config/db.js';

const serviceUsageInclude = {
  service: true,
  booking: true,
};

export const findServiceUsages = ({ bookingId, serviceId } = {}) => {
  return prisma.serviceUsage.findMany({
    where: {
      ...(bookingId ? { booking_id: BigInt(bookingId) } : {}),
      ...(serviceId ? { service_id: BigInt(serviceId) } : {}),
    },
    include: serviceUsageInclude,
    orderBy: {
      service_usage_id: 'desc',
    },
  });
};

export const findServiceUsageById = (serviceUsageId) => {
  return prisma.serviceUsage.findUnique({
    where: {
      service_usage_id: BigInt(serviceUsageId),
    },
    include: serviceUsageInclude,
  });
};

export const createServiceUsageRecord = (data) => {
  return prisma.serviceUsage.create({
    data,
    include: serviceUsageInclude,
  });
};

export const updateServiceUsageRecord = (serviceUsageId, data) => {
  return prisma.serviceUsage.update({
    where: {
      service_usage_id: BigInt(serviceUsageId),
    },
    data,
    include: serviceUsageInclude,
  });
};

export const deleteServiceUsageRecord = (serviceUsageId) => {
  return prisma.serviceUsage.delete({
    where: {
      service_usage_id: BigInt(serviceUsageId),
    },
  });
};
