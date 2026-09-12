import { findBookingById, updateBookingRecord } from '../models/booking.model.js';
import { findInvoiceById, findInvoices, updateInvoiceRecord } from '../models/invoice.model.js';
import {
  createPaymentRecord,
  deletePaymentRecord,
  findPaymentById,
  findPayments,
  updatePaymentRecord,
} from '../models/payment.model.js';
import { findPublicUserById } from '../models/user.model.js';
import { addInvoice } from './invoice.service.js';
import { createHttpError } from '../utils/response.js';

const ensureAdminUser = async (userId) => {
  const user = await findPublicUserById(userId);

  if (!user || user.role?.role_name !== 'admin') {
    throw createHttpError(400, 'Nguoi thuc hien phai la admin');
  }
};

export const listPayments = (filters) => {
  return findPayments(filters);
};

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw createHttpError(500, `${key} is not configured`);
  }

  return value;
};

const getInvoicePayableAmount = (invoice, payloadAmount) => {
  if (payloadAmount !== undefined) {
    const amount = Number(payloadAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createHttpError(400, 'So tien thanh toan khong hop le');
    }

    return Math.round(amount);
  }

  const paidAmount = invoice.payments.reduce((total, item) => {
    return item.status === 'success' ? total + Number(item.amount) : total;
  }, 0);
  const remainingAmount = Number(invoice.total_amount) - paidAmount;

  if (!Number.isFinite(remainingAmount) || remainingAmount <= 0) {
    throw createHttpError(400, 'Hoa don da duoc thanh toan');
  }

  return Math.round(remainingAmount);
};

const ensureInvoiceCanBePaid = async (invoiceId, actor) => {
  const invoice = await findInvoiceById(invoiceId);

  if (!invoice) {
    throw createHttpError(400, 'Hoa don khong ton tai');
  }

  const invoiceUserId = invoice.booking?.user_id?.toString();
  const isOwner = invoiceUserId && invoiceUserId === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError(403, 'Ban khong co quyen thanh toan hoa don nay');
  }

  return invoice;
};

const ensureBookingCanBePaid = async (bookingId, actor) => {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw createHttpError(400, 'Dat phong khong ton tai');
  }

  const isOwner = booking.user_id?.toString() === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError(403, 'Ban khong co quyen thanh toan dat phong nay');
  }

  return booking;
};

const resolvePayableInvoice = async (payload, actor) => {
  if (payload.invoice_id) {
    return ensureInvoiceCanBePaid(payload.invoice_id, actor);
  }

  if (!payload.booking_id) {
    throw createHttpError(400, 'Can truyen invoice_id hoac booking_id');
  }

  await ensureBookingCanBePaid(payload.booking_id, actor);

  const existingInvoices = await findInvoices({ bookingId: payload.booking_id });
  const existingInvoice = existingInvoices.find((invoice) => invoice.invoice_status !== 'cancelled');

  if (existingInvoice) {
    return existingInvoice;
  }

  const invoice = await addInvoice({
    booking_id: payload.booking_id,
  });

  return invoice;
};

const createPendingGatewayPayment = async ({ invoiceId, amount, method, actor }) => {
  return createPaymentRecord({
    invoice_id: BigInt(invoiceId),
    amount: amount.toString(),
    payment_method: method,
    status: 'pending',
    paid_at: new Date(),
    staff_id: BigInt(actor.id),
  });
};

const refreshInvoicePaymentStatus = async (invoiceId) => {
  const invoice = await findInvoiceById(invoiceId);

  if (!invoice) {
    return null;
  }

  const paidAmount = invoice.payments.reduce((total, item) => {
    return item.status === 'success' ? total + Number(item.amount) : total;
  }, 0);
  const totalAmount = Number(invoice.total_amount);

  if (paidAmount <= 0) {
    return invoice;
  }

  const updatedInvoice = await updateInvoiceRecord(invoice.invoice_id, {
    invoice_status: paidAmount >= totalAmount ? 'paid' : 'partial_paid',
    updated_at: new Date(),
  });

  if (paidAmount >= totalAmount && invoice.booking_id && invoice.booking?.status === 'pending') {
    await updateBookingRecord(invoice.booking_id, {
      status: 'confirmed',
      updated_at: new Date(),
    });
  }

  return updatedInvoice;
};

const ensurePaymentBelongsToActor = async (payment, actor) => {
  const invoice = await findInvoiceById(payment.invoice_id);
  const invoiceUserId = invoice?.booking?.user_id?.toString();
  const isOwner = invoiceUserId && invoiceUserId === actor.id;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw createHttpError(403, 'Ban khong co quyen kiem tra thanh toan nay');
  }

  return invoice;
};

const markPaymentStatus = async (paymentId, status) => {
  const payment = await updatePaymentRecord(paymentId, {
    status,
    paid_at: new Date(),
  });

  if (status === 'success') {
    await refreshInvoicePaymentStatus(payment.invoice_id);
  }

  return payment;
};

const resolvePaymentIdFromTransferContent = (transferContent = '') => {
  const match = transferContent.match(/\bP(\d+)\b/i);
  return match?.[1] ?? null;
};

export const confirmBankTransferTransaction = async (payload) => {
  const paymentId = payload.payment_id || resolvePaymentIdFromTransferContent(payload.transferContent || '');

  if (!paymentId) {
    throw createHttpError(400, 'Khong tim thay ma thanh toan trong giao dich');
  }

  const payment = await getPayment(paymentId);

  if (payment.payment_method !== 'bank_transfer') {
    throw createHttpError(400, 'Thanh toan nay khong phai VietQR');
  }

  if (payload.amount !== undefined) {
    const paidAmount = Number(payload.amount);
    const expectedAmount = Number(payment.amount);

    if (!Number.isFinite(paidAmount) || paidAmount < expectedAmount) {
      throw createHttpError(400, 'So tien giao dich khong du de xac nhan thanh toan');
    }
  }

  if (payment.status === 'success') {
    return payment;
  }

  return markPaymentStatus(paymentId, 'success');
};

export const confirmLocalPayment = async (paymentId, actor) => {
  if (process.env.PAYMENT_ALLOW_LOCAL_CONFIRM === 'false') {
    throw createHttpError(403, 'Local payment confirm is disabled');
  }

  const payment = await getPayment(paymentId);
  await ensurePaymentBelongsToActor(payment, actor);

  return markPaymentStatus(paymentId, 'success');
};

export const confirmVietQrWebhookPayment = async (payload, token) => {
  const expectedToken = process.env.VIETQR_WEBHOOK_TOKEN;

  if (!expectedToken) {
    throw createHttpError(403, 'VietQR webhook token is not configured');
  }

  if (token !== expectedToken) {
    throw createHttpError(401, 'Webhook token khong hop le');
  }

  return confirmBankTransferTransaction(payload);
};

export const verifyVietQrPayment = async (paymentId, actor) => {
  const payment = await getPayment(paymentId);
  await ensurePaymentBelongsToActor(payment, actor);

  if (payment.payment_method !== 'bank_transfer') {
    throw createHttpError(400, 'Thanh toan nay khong phai VietQR');
  }

  return payment;
};

export const getPayment = async (paymentId) => {
  const payment = await findPaymentById(paymentId);

  if (!payment) {
    throw createHttpError(404, 'Khong tim thay thanh toan');
  }

  return payment;
};

export const addPayment = async (payload, actor) => {
  const invoice = await findInvoiceById(payload.invoice_id);

  if (!invoice) {
    throw createHttpError(400, 'Hoa don khong ton tai');
  }

  const staffId = payload.staff_id || actor.id;
  await ensureAdminUser(staffId);

  const payment = await createPaymentRecord({
    invoice_id: BigInt(payload.invoice_id),
    amount: payload.amount.toString(),
    payment_method: payload.payment_method,
    status: payload.status || 'pending',
    paid_at: payload.paid_at ? new Date(payload.paid_at) : new Date(),
    staff_id: BigInt(staffId),
  });

  if (payment.status === 'success') {
    const paidAmount =
      invoice.payments.reduce((total, item) => {
        return item.status === 'success' ? total + Number(item.amount) : total;
      }, 0) + Number(payment.amount);
    const totalAmount = Number(invoice.total_amount);

    await updateInvoiceRecord(invoice.invoice_id, {
      invoice_status: paidAmount >= totalAmount ? 'paid' : 'partial_paid',
      updated_at: new Date(),
    });
  }

  return payment;
};

export const createVietQrPayment = async (payload, actor) => {
  const invoice = await resolvePayableInvoice(payload, actor);
  const amount = getInvoicePayableAmount(invoice, payload.amount);
  const payment = await createPendingGatewayPayment({
    invoiceId: invoice.invoice_id.toString(),
    amount,
    method: 'bank_transfer',
    actor,
  });
  const bank = getRequiredEnv('VIETQR_BANK');
  const account = getRequiredEnv('VIETQR_ACCOUNT');
  const transferContent = payload.transferContent || `VIP ${invoice.invoice_code} P${payment.payment_id}`;
  const accountName = process.env.VIETQR_ACCOUNT_NAME || '';
  const query = new URLSearchParams({
    amount: String(amount),
    addInfo: transferContent,
    ...(accountName ? { accountName } : {}),
  });
  const qrImageUrl = `https://img.vietqr.io/image/${encodeURIComponent(bank)}-${encodeURIComponent(account)}-compact2.png?${query.toString()}`;

  return {
    payment,
    provider: 'vietqr',
    amount,
    bank,
    account,
    accountName,
    transferContent,
    qrImageUrl,
  };
};

export const editPayment = async (paymentId, payload) => {
  await getPayment(paymentId);

  if (payload.staff_id) {
    await ensureAdminUser(payload.staff_id);
  }

  return updatePaymentRecord(paymentId, {
    ...(payload.amount !== undefined ? { amount: payload.amount.toString() } : {}),
    ...(payload.payment_method ? { payment_method: payload.payment_method } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.paid_at ? { paid_at: new Date(payload.paid_at) } : {}),
    ...(payload.staff_id ? { staff_id: BigInt(payload.staff_id) } : {}),
  });
};

export const removePayment = async (paymentId) => {
  await getPayment(paymentId);
  await deletePaymentRecord(paymentId);
};
