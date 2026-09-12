import prisma from '../config/db.js';
import { publicUserSelect } from './user.model.js';

const bookingInclude = {
  details: {
    include: {
      room: {
        include: {
          room_type: true,
        },
      },
    },
  },
  serviceUsages: {
    include: {
      service: true,
    },
  },
  invoices: true,
  checkins: true,
};

const hydrateBookingUsers = async (bookings, client = prisma) => {
  const records = Array.isArray(bookings) ? bookings : [bookings];
  const userIds = [...new Set(records.filter(Boolean).map((booking) => booking.user_id))];

  if (userIds.length === 0) {
    return bookings;
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
  const hydrated = records.map((booking) => (
    booking
      ? {
          ...booking,
          user: usersById.get(booking.user_id.toString()) ?? null,
        }
      : booking
  ));

  return Array.isArray(bookings) ? hydrated : hydrated[0];
};

export const findBookings = async ({ userId, status } = {}) => {
  const bookings = await prisma.booking.findMany({
    where: {
      ...(userId ? { user_id: BigInt(userId) } : {}),
      ...(status ? { status } : {}),
    },
    include: bookingInclude,
    orderBy: {
      booking_id: 'desc',
    },
  });

  return hydrateBookingUsers(bookings);
};

export const findBookingById = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: {
      booking_id: BigInt(bookingId),
    },
    include: bookingInclude,
  });

  return hydrateBookingUsers(booking);
};

export const createBookingRecord = (bookingData, detailsData) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: bookingData,
    });

    if (detailsData.length > 0) {
      await tx.bookingDetail.createMany({
        data: detailsData.map((detail) => ({
          ...detail,
          booking_id: booking.booking_id,
        })),
      });
    }

    const nextBooking = await tx.booking.findUnique({
      where: {
        booking_id: booking.booking_id,
      },
      include: bookingInclude,
    });

    return hydrateBookingUsers(nextBooking, tx);
  });
};

export const updateBookingRecord = async (bookingId, data) => {
  const booking = await prisma.booking.update({
    where: {
      booking_id: BigInt(bookingId),
    },
    data,
    include: bookingInclude,
  });

  return hydrateBookingUsers(booking);
};

export const deleteBookingRecord = (bookingId) => {
  return prisma.booking.delete({
    where: {
      booking_id: BigInt(bookingId),
    },
  });
};
