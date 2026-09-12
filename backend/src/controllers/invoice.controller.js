import { z } from 'zod';
import {
  addInvoice,
  editInvoice,
  getInvoice,
  listInvoices,
  removeInvoice,
} from '../services/invoice.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');
const invoiceStatusSchema = z.enum(['unpaid', 'partial_paid', 'paid', 'cancelled']);
const itemTypeSchema = z.enum(['room', 'service', 'surcharge', 'discount']);
const decimalSchema = z.union([z.string(), z.number()]);

const detailSchema = z.object({
  item_type: itemTypeSchema,
  reference_id: idSchema.optional().nullable(),
  description: z.string().trim().min(1, 'Vui lòng nhập mô tả'),
  quantity: z.coerce.number().int().positive().default(1),
  unit_price: decimalSchema,
  amount: decimalSchema,
});

const schema = z.object({
  booking_id: idSchema,
  invoice_code: z.string().trim().optional(),
  issued_date: z.string().optional(),
  room_amount: decimalSchema.optional(),
  service_amount: decimalSchema.optional(),
  surcharge_amount: decimalSchema.optional(),
  discount_amount: decimalSchema.optional(),
  tax_amount: decimalSchema.optional(),
  invoice_status: invoiceStatusSchema.optional(),
  note: z.string().trim().optional().nullable(),
  details: z.array(detailSchema).optional(),
});
const updateSchema = schema
  .omit({ booking_id: true, invoice_code: true, issued_date: true, details: true })
  .partial()
  .extend({ total_amount: decimalSchema.optional() });
const querySchema = z.object({
  bookingId: idSchema.optional(),
  status: invoiceStatusSchema.optional(),
});

export const index = async (req, res) => {
  try {
    const invoices = await listInvoices(querySchema.parse(req.query));
    return sendSuccess(res, { data: { invoices } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const invoice = await getInvoice(idSchema.parse(req.params.id));
    return sendSuccess(res, { data: { invoice } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const invoice = await addInvoice(schema.parse(req.body));
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo hóa đơn thành công',
      data: { invoice },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const invoice = await editInvoice(idSchema.parse(req.params.id), updateSchema.parse(req.body));
    return sendSuccess(res, {
      message: 'Cập nhật hóa đơn thành công',
      data: { invoice },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removeInvoice(idSchema.parse(req.params.id));
    return sendSuccess(res, { message: 'Xóa hóa đơn thành công' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
