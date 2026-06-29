const bookingService = require('../services/booking.service');
const { CreateBookingDTO } = require('../dtos/booking.dto');
require('dotenv').config();

const EXPIRY_MINUTES = parseInt(process.env.BOOKING_EXPIRY_MINUTES || '1');

class BookingController {
  async getAll(req, res) {
    try {
      const bookings = await bookingService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async create(req, res) {
    const validation = CreateBookingDTO.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const dto = new CreateBookingDTO(req.body);

    try {
      const booking = await bookingService.createBooking(dto);
      res.status(201).json({
        message: 'Booking created successfully (awaiting payment).',
        booking_id: booking.id,
        status: booking.status,
        expires_in_minutes: EXPIRY_MINUTES
      });
    } catch (error) {
      if (error.message === 'BOOKING_CONFLICT') {
        return res.status(409).json({ error: 'Table is already booked at this time.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Failed to create booking due to internal error.' });
    }
  }

  async pay(req, res) {
    const { id } = req.params;
    try {
      const result = await bookingService.payBooking(id);
      res.json({
        message: 'Payment successful. Booking confirmed.',
        booking_id: result.bookingId,
        status: result.status
      });
    } catch (error) {
      res.status(400).json({ error: 'Booking not found, already paid, or has been canceled due to timeout.' });
    }
  }
}

module.exports = new BookingController();
