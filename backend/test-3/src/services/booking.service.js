const prisma = require('../prisma');
const { BookingStatus } = require('@prisma/client');

class BookingService {
  async getAllBookings() {
    const bookings = await prisma.booking.findMany({
      include: {
        customer: {
          select: { full_name: true, phone_number: true }
        },
        booking_tables: {
          include: {
            table: { select: { table_number: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return bookings
  }

  async createBooking(dto) {
    const { customerId, tableIds, bookingTime } = dto;

    try {
      return await prisma.$transaction(async (tx) => {
        const bookingConflict = await tx.bookingTable.findFirst({
          where: {
            table_id: { in: tableIds },
            booking_time: new Date(bookingTime),
            booking: {
              status: {
                in: [BookingStatus.Created, BookingStatus.Paid]
              }
            }
          }
        });

        if (bookingConflict) {
          throw new Error('BOOKING_CONFLICT');
        }

        const booking = await tx.booking.create({
          data: {
            customer_id: customerId,
            status: BookingStatus.Created,
            created_at: new Date()
          }
        });

        await tx.bookingTable.createMany({
          data: tableIds.map(tId => ({
            booking_id: booking.id,
            table_id: tId,
            booking_time: new Date(bookingTime)
          }))
        });

        return booking;
      }, {
        isolationLevel: 'Serializable'
      });
    } catch (error) {
      if (error.code === 'P2034' || error.message === 'BOOKING_CONFLICT') {
        throw new Error('BOOKING_CONFLICT');
      }
      throw error;
    }
  }

  async payBooking(bookingId) {
    const result = await prisma.booking.updateMany({
      where: {
        id: bookingId,
        status: BookingStatus.Created
      },
      data: {
        status: BookingStatus.Paid,
        paid_at: new Date()
      }
    });

    if (result.count === 0) {
      throw new Error('BOOKING_NOT_FOUND_OR_UNPAID');
    }

    return { bookingId, status: BookingStatus.Paid };
  }

  async cancelExpiredBookings(expiryMinutes) {
    const expiryThreshold = new Date(Date.now() - expiryMinutes * 60 * 1000);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.Created,
        created_at: {
          lte: expiryThreshold
        }
      },
      select: { id: true, created_at: true }
    });

    if (expiredBookings.length > 0) {
      const ids = expiredBookings.map(b => b.id);
      await prisma.booking.updateMany({
        where: { id: { in: ids } },
        data: { status: BookingStatus.Canceled }
      });
    }

    return expiredBookings;
  }
}

module.exports = new BookingService();
