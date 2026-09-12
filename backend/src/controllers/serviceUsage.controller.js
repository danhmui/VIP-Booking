import { z } from 'zod';
import {
  addServiceUsage,
  editServiceUsage,
  getServiceUsage,
  listServiceUsages,
  removeServiceUsage,
} from '../services/serviceUsage.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');
const schema = z.object({
  service_id: idSchema,
  quantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
  unit_price: z.union([z.string(), z.number()]).optional(),
  note: z.string().trim().optional().nullable(),
  used_at: z.string().optional(),
  booking_id: idSchema.optional().nullable(),
});
const updateSchema = schema.partial();
const querySchema = z.object({
  bookingId: idSchema.optional(),
  serviceId: idSchema.optional(),
});

export const index = async (req, res) => {
  try {
    const serviceUsages = await listServiceUsages(querySchema.parse(req.query));
    return sendSuccess(res, { data: { serviceUsages } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const serviceUsage = await getServiceUsage(idSchema.parse(req.params.id));
    return sendSuccess(res, { data: { serviceUsage } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const serviceUsage = await addServiceUsage(schema.parse(req.body));
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Ghi nhận dịch vụ sử dụng thành công',
      data: { serviceUsage },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const serviceUsage = await editServiceUsage(idSchema.parse(req.params.id), updateSchema.parse(req.body));
    return sendSuccess(res, {
      message: 'Cập nhật dịch vụ sử dụng thành công',
      data: { serviceUsage },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removeServiceUsage(idSchema.parse(req.params.id));
    return sendSuccess(res, { message: 'Xóa dịch vụ sử dụng thành công' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
