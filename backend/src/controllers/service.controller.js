import { z } from 'zod';
import {
  addService,
  editService,
  getService,
  listServices,
  removeService,
} from '../services/hotelService.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');

const serviceStatusSchema = z.enum(['active', 'inactive']);

const serviceSchema = z.object({
  service_name: z.string().trim().min(2, 'Tên dịch vụ phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional().nullable(),
  unit_price: z.union([z.string(), z.number()]).transform((value) => value.toString()),
  unit: z.string().trim().min(1, 'Vui lòng nhập đơn vị tính'),
  status: serviceStatusSchema,
  duration: z.coerce.number().int().positive().optional().nullable(),
});

const updateServiceSchema = serviceSchema.partial();

const querySchema = z.object({
  search: z.string().trim().optional(),
  status: serviceStatusSchema.optional(),
});

export const index = async (req, res) => {
  try {
    const filters = querySchema.parse(req.query);
    const services = await listServices(filters);

    return sendSuccess(res, {
      data: { services },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const serviceId = idSchema.parse(req.params.id);
    const service = await getService(serviceId);

    return sendSuccess(res, {
      data: { service },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const payload = serviceSchema.parse(req.body);
    const service = await addService(payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo dịch vụ thành công',
      data: { service },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const serviceId = idSchema.parse(req.params.id);
    const payload = updateServiceSchema.parse(req.body);
    const service = await editService(serviceId, payload);

    return sendSuccess(res, {
      message: 'Cập nhật dịch vụ thành công',
      data: { service },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    const serviceId = idSchema.parse(req.params.id);
    await removeService(serviceId);

    return sendSuccess(res, {
      message: 'Xóa dịch vụ thành công',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
