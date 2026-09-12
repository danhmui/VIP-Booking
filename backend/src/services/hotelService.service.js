import {
  createService,
  deleteService,
  findServiceById,
  findServices,
  updateService,
} from '../models/service.model.js';
import { createHttpError } from '../utils/response.js';

export const listServices = (filters) => {
  return findServices(filters);
};

export const getService = async (serviceId) => {
  const service = await findServiceById(serviceId);

  if (!service) {
    throw createHttpError(404, 'Không tìm thấy dịch vụ');
  }

  return service;
};

export const addService = (payload) => {
  return createService(payload);
};

export const editService = async (serviceId, payload) => {
  await getService(serviceId);

  return updateService(serviceId, {
    ...payload,
    updated_at: new Date(),
  });
};

export const removeService = async (serviceId) => {
  await getService(serviceId);
  await deleteService(serviceId);
};
