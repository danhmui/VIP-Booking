import prisma from '../config/db.js';

const paymentInclude = {
  invoice: true,
  staff: {
    select: {
      user_id: true,
      email: true,
      full_name: true,
      role: true,
    },
  },
};

export const findPayments = ({ invoiceId, status, staffId } = {}) => {
  return prisma.payment.findMany({
    where: {
      ...(invoiceId ? { invoice_id: BigInt(invoiceId) } : {}),
      ...(status ? { status } : {}),
      ...(staffId ? { staff_id: BigInt(staffId) } : {}),
    },
    include: paymentInclude,
    orderBy: {
      payment_id: 'desc',
    },
  });
};

export const findPaymentById = (paymentId) => {
  return prisma.payment.findUnique({
    where: {
      payment_id: BigInt(paymentId),
    },
    include: paymentInclude,
  });
};

export const createPaymentRecord = (data) => {
  return prisma.payment.create({
    data,
    include: paymentInclude,
  });
};

export const updatePaymentRecord = (paymentId, data) => {
  return prisma.payment.update({
    where: {
      payment_id: BigInt(paymentId),
    },
    data,
    include: paymentInclude,
  });
};

export const deletePaymentRecord = (paymentId) => {
  return prisma.payment.delete({
    where: {
      payment_id: BigInt(paymentId),
    },
  });
};
