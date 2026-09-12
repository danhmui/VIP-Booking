import prisma from '../config/db.js';
import { publicUserSelect } from './user.model.js';

const invoiceInclude = {
  booking: {
    include: {
      details: true,
      serviceUsages: true,
    },
  },
  details: true,
  payments: true,
};

const hydrateInvoiceBookingUsers = async (invoices, client = prisma) => {
  const records = Array.isArray(invoices) ? invoices : [invoices];
  const userIds = [
    ...new Set(
      records
        .map((invoice) => invoice?.booking?.user_id)
        .filter(Boolean),
    ),
  ];

  if (userIds.length === 0) {
    return invoices;
  }

  const users = await client.user.findMany({
    where: {
      user_id: {
        in: userIds,
      },
    },
    select: publicUserSelect,
  });
  const usersById = new Map(users.map((user) => [user.user_id.toString(), user]));
  const hydrated = records.map((invoice) => {
    if (!invoice?.booking) {
      return invoice;
    }

    return {
      ...invoice,
      booking: {
        ...invoice.booking,
        user: usersById.get(invoice.booking.user_id.toString()) ?? null,
      },
    };
  });

  return Array.isArray(invoices) ? hydrated : hydrated[0];
};

export const findInvoices = async ({ bookingId, status } = {}) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      ...(bookingId ? { booking_id: BigInt(bookingId) } : {}),
      ...(status ? { invoice_status: status } : {}),
    },
    include: invoiceInclude,
    orderBy: {
      invoice_id: 'desc',
    },
  });

  return hydrateInvoiceBookingUsers(invoices);
};

export const findInvoiceById = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: {
      invoice_id: BigInt(invoiceId),
    },
    include: invoiceInclude,
  });

  return hydrateInvoiceBookingUsers(invoice);
};

export const createInvoiceRecord = (invoiceData, detailsData) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: invoiceData,
    });

    if (detailsData.length > 0) {
      await tx.invoiceDetail.createMany({
        data: detailsData.map((detail) => ({
          ...detail,
          invoice_id: invoice.invoice_id,
        })),
      });
    }

    const nextInvoice = await tx.invoice.findUnique({
      where: {
        invoice_id: invoice.invoice_id,
      },
      include: invoiceInclude,
    });

    return hydrateInvoiceBookingUsers(nextInvoice, tx);
  });
};

export const updateInvoiceRecord = async (invoiceId, data) => {
  const invoice = await prisma.invoice.update({
    where: {
      invoice_id: BigInt(invoiceId),
    },
    data,
    include: invoiceInclude,
  });

  return hydrateInvoiceBookingUsers(invoice);
};

export const deleteInvoiceRecord = (invoiceId) => {
  return prisma.invoice.delete({
    where: {
      invoice_id: BigInt(invoiceId),
    },
  });
};
