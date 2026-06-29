const cron = require('node-cron');
const bookingService = require('../services/booking.service');
require('dotenv').config();

const EXPIRY_MINUTES = parseInt(process.env.BOOKING_EXPIRY_MINUTES || '1');

function startScheduler() {
  console.log(`[Scheduler] Auto-cancel cron job active. Expiry set to ${EXPIRY_MINUTES} minute(s).`);
  
  cron.schedule('* * * * * *', async () => {
    try {
      const canceledBookings = await bookingService.cancelExpiredBookings(EXPIRY_MINUTES);
      if (canceledBookings.length > 0) {
        console.log(`[Scheduler] Auto-canceled ${canceledBookings.length} expired bookings:`);
        canceledBookings.forEach(b => console.log(`  - Booking ID: ${b.id} (Created at: ${b.created_at})`));
      }
    } catch (error) {
      console.error('[Scheduler Error] Failed to scan expired bookings:', error);
    }
  });
}

module.exports = {
  startScheduler
};
