import { z } from 'zod';
import {
  addPayment,
  confirmLocalPayment,
  confirmVietQrWebhookPayment,
  createVietQrPayment,
  editPayment,
  getPayment,
  listPayments,
  removePayment,
  verifyVietQrPayment,
} from '../services/payment.service.js';
import { syncSepayTransactions } from '../services/sepay.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');
const paymentMethodSchema = z.enum(['cash', 'bank_transfer', 'online']);
const paymentStatusSchema = z.enum(['pending', 'success', 'failed', 'refunded']);
const decimalSchema = z.union([z.string(), z.number()]);
const schema = z.object({
  invoice_id: idSchema,
  amount: decimalSchema,
  payment_method: paymentMethodSchema,
  status: paymentStatusSchema.optional(),
  paid_at: z.string().optional(),
  staff_id: idSchema.optional(),
});
const updateSchema = schema.omit({ invoice_id: true }).partial();
const querySchema = z.object({
  invoiceId: idSchema.optional(),
  staffId: idSchema.optional(),
  status: paymentStatusSchema.optional(),
});
const gatewaySchema = z.object({
  invoice_id: idSchema.optional(),
  booking_id: idSchema.optional(),
  amount: decimalSchema.optional(),
  transferContent: z.string().trim().optional(),
}).refine((payload) => payload.invoice_id || payload.booking_id, {
  message: 'Can truyen invoice_id hoac booking_id',
});
const webhookSchema = z.object({
  payment_id: idSchema.optional(),
  paymentId: idSchema.optional(),
  amount: decimalSchema.optional(),
  transferContent: z.string().trim().optional(),
  content: z.string().trim().optional(),
  description: z.string().trim().optional(),
  transaction_content: z.string().trim().optional(),
  amount_in: decimalSchema.optional(),
}).transform((payload) => ({
  payment_id: payload.payment_id || payload.paymentId,
  amount: payload.amount || payload.amount_in,
  transferContent: payload.transferContent || payload.content || payload.description || payload.transaction_content,
}));

export const index = async (req, res) => {
  try {
    const payments = await listPayments(querySchema.parse(req.query));
    return sendSuccess(res, { data: { payments } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const payment = await getPayment(idSchema.parse(req.params.id));
    return sendSuccess(res, { data: { payment } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const payment = await addPayment(schema.parse(req.body), req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo thanh toán thành công',
      data: { payment },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const createVietQr = async (req, res) => {
  try {
    const paymentRequest = await createVietQrPayment(gatewaySchema.parse(req.body), req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tao ma VietQR thanh cong',
      data: paymentRequest,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const syncSepay = async (req, res) => {
  try {
    const result = await syncSepayTransactions();
    return sendSuccess(res, {
      message: result.skipped ? 'Chua cau hinh SePay API token' : 'Dong bo giao dich SePay thanh cong',
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const confirmLocal = async (req, res) => {
  try {
    const payment = await confirmLocalPayment(idSchema.parse(req.params.id), req.user);
    return sendSuccess(res, {
      message: 'Xac nhan thanh toan local thanh cong',
      data: { payment },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const confirmVietQrWebhook = async (req, res) => {
  try {
    const payment = await confirmVietQrWebhookPayment(
      webhookSchema.parse(req.body),
      req.get('x-webhook-token'),
    );
    return sendSuccess(res, {
      message: 'Xac nhan thanh toan VietQR webhook thanh cong',
      data: { payment },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const verifyVietQr = async (req, res) => {
  try {
    const payment = await verifyVietQrPayment(idSchema.parse(req.params.id), req.user);
    return sendSuccess(res, {
      message: payment.status === 'success'
        ? 'Da ghi nhan tien VietQR'
        : 'Chua ghi nhan tien VietQR',
      data: { payment },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const payment = await editPayment(idSchema.parse(req.params.id), updateSchema.parse(req.body));
    return sendSuccess(res, {
      message: 'Cập nhật thanh toán thành công',
      data: { payment },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removePayment(idSchema.parse(req.params.id));
    return sendSuccess(res, { message: 'Xóa thanh toán thành công' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
