const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');

router.get('/', tableController.getAll);

module.exports = router;
