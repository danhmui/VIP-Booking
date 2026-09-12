import { findBookingById } from '../models/booking.model.js';
import {
  createInvoiceRecord,
  deleteInvoiceRecord,
  findInvoiceById,
  findInvoices,
  updateInvoiceRecord,
} from '../models/invoice.model.js';
import { createHttpError } from '../utils/response.js';

const sumDecimal = (items, key) => {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
};

const generateInvoiceCode = () => {
  return `INV-${Date.now()}`;
};

export const listInvoices = (filters) => {
  return findInvoices(filters);
};

export const getInvoice = async (invoiceId) => {
  const invoice = await findInvoiceById(invoiceId);

  if (!invoice) {
    throw createHttpError(404, 'Không tìm thấy hóa đơn');
  }

  return invoice;
};

export const addInvoice = async (payload) => {
  const booking = await findBookingById(payload.booking_id);

  if (!booking) {
    throw createHttpError(400, 'Đặt phòng không tồn tại');
  }

  const roomAmount = payload.room_amount ?? sumDecimal(booking.details, 'subtotal');
  const serviceAmount = payload.service_amount ?? sumDecimal(booking.serviceUsages, 'subtotal');
  const surchargeAmount = Number(payload.surcharge_amount || 0);
  const discountAmount = Number(payload.discount_amount || 0);
  const taxAmount = Number(payload.tax_amount || 0);
  const totalAmount =
    Number(roomAmount) + Number(serviceAmount) + surchargeAmount - discountAmount + taxAmount;

  const details = [
    ...booking.details.map((detail) => ({
      item_type: 'room',
      reference_id: detail.room_id,
      description: `Phòng ${detail.room?.room_number || detail.room_id}`,
      quantity: detail.number_of_nights,
      unit_price: detail.price_per_night,
      amount: detail.subtotal,
    })),
    ...booking.serviceUsages.map((usage) => ({
      item_type: 'service',
      reference_id: usage.service_id,
      description: usage.service?.service_name || `Dịch vụ ${usage.service_id}`,
      quantity: usage.quantity,
      unit_price: usage.unit_price,
      amount: usage.subtotal,
    })),
    ...(payload.details || []).map((detail) => ({
      item_type: detail.item_type,
      reference_id: detail.reference_id ? BigInt(detail.reference_id) : null,
      description: detail.description,
      quantity: detail.quantity,
      unit_price: detail.unit_price.toString(),
      amount: detail.amount.toString(),
    })),
  ];

  return createInvoiceRecord(
    {
      booking_id: BigInt(payload.booking_id),
      invoice_code: payload.invoice_code || generateInvoiceCode(),
      issued_date: payload.issued_date ? new Date(payload.issued_date) : new Date(),
      room_amount: Number(roomAmount).toFixed(2),
      service_amount: Number(serviceAmount).toFixed(2),
      surcharge_amount: surchargeAmount.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      invoice_status: payload.invoice_status || 'unpaid',
      note: payload.note || null,
    },
    details,
  );
};

export const editInvoice = async (invoiceId, payload) => {
  await getInvoice(invoiceId);

  return updateInvoiceRecord(invoiceId, {
    ...(payload.invoice_status ? { invoice_status: payload.invoice_status } : {}),
    ...(payload.note !== undefined ? { note: payload.note || null } : {}),
    ...(payload.surcharge_amount !== undefined
      ? { surcharge_amount: payload.surcharge_amount.toString() }
      : {}),
    ...(payload.discount_amount !== undefined
      ? { discount_amount: payload.discount_amount.toString() }
      : {}),
    ...(payload.tax_amount !== undefined ? { tax_amount: payload.tax_amount.toString() } : {}),
    ...(payload.total_amount !== undefined ? { total_amount: payload.total_amount.toString() } : {}),
    updated_at: new Date(),
  });
};

export const removeInvoice = async (invoiceId) => {
  await getInvoice(invoiceId);
  await deleteInvoiceRecord(invoiceId);
};
