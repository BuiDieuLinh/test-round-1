const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

router.get('/', bookingController.getAll);
router.post('/', bookingController.create);
router.post('/:id/pay', bookingController.pay);

module.exports = router;
