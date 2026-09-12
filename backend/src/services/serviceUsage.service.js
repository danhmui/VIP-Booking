import { findBookingById } from '../models/booking.model.js';
import { findServiceById } from '../models/service.model.js';
import {
  createServiceUsageRecord,
  deleteServiceUsageRecord,
  findServiceUsageById,
  findServiceUsages,
  updateServiceUsageRecord,
} from '../models/serviceUsage.model.js';
import { createHttpError } from '../utils/response.js';

const buildAmounts = async ({ service_id, quantity, unit_price }) => {
  const service = await findServiceById(service_id);

  if (!service) {
    throw createHttpError(400, 'Dịch vụ không tồn tại');
  }

  const effectiveUnitPrice = unit_price?.toString() || service.unit_price.toString();

  return {
    unit_price: effectiveUnitPrice,
    subtotal: (Number(effectiveUnitPrice) * quantity).toFixed(2),
  };
};

export const listServiceUsages = (filters) => {
  return findServiceUsages(filters);
};

export const getServiceUsage = async (serviceUsageId) => {
  const serviceUsage = await findServiceUsageById(serviceUsageId);

  if (!serviceUsage) {
    throw createHttpError(404, 'Không tìm thấy dịch vụ đã sử dụng');
  }

  return serviceUsage;
};

export const addServiceUsage = async (payload) => {
  if (payload.booking_id) {
    const booking = await findBookingById(payload.booking_id);

    if (!booking) {
      throw createHttpError(400, 'Đặt phòng không tồn tại');
    }
  }

  const amounts = await buildAmounts(payload);

  return createServiceUsageRecord({
    service_id: BigInt(payload.service_id),
    quantity: payload.quantity,
    unit_price: amounts.unit_price,
    subtotal: amounts.subtotal,
    note: payload.note || null,
    used_at: payload.used_at ? new Date(payload.used_at) : new Date(),
    booking_id: payload.booking_id ? BigInt(payload.booking_id) : null,
  });
};

export const editServiceUsage = async (serviceUsageId, payload) => {
  const existing = await getServiceUsage(serviceUsageId);
  const serviceId = payload.service_id || existing.service_id.toString();
  const quantity = payload.quantity || existing.quantity;
  const amounts =
    payload.service_id || payload.quantity || payload.unit_price
      ? await buildAmounts({
          service_id: serviceId,
          quantity,
          unit_price: payload.unit_price,
        })
      : {};

  return updateServiceUsageRecord(serviceUsageId, {
    ...(payload.service_id ? { service_id: BigInt(payload.service_id) } : {}),
    ...(payload.quantity ? { quantity } : {}),
    ...amounts,
    ...(payload.note !== undefined ? { note: payload.note || null } : {}),
    ...(payload.used_at ? { used_at: new Date(payload.used_at) } : {}),
    ...(payload.booking_id !== undefined
      ? { booking_id: payload.booking_id ? BigInt(payload.booking_id) : null }
      : {}),
  });
};

export const removeServiceUsage = async (serviceUsageId) => {
  await getServiceUsage(serviceUsageId);
  await deleteServiceUsageRecord(serviceUsageId);
};
