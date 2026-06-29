const express = require('express');
const router = express.Router();
const bookingRoutes = require('./booking.routes');
const tableRoutes = require('./table.routes');
const customerRoutes = require('./customer.routes');

router.use('/bookings', bookingRoutes);
router.use('/tables', tableRoutes);
router.use('/customers', customerRoutes);

module.exports = router;
