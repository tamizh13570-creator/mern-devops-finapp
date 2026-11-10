const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

// View summary
router.get('/summary/:monthYear?', reportController.getMonthSummary);

// Direct local disk download endpoints
router.get('/download/csv/:monthYear?', reportController.downloadCSV);
router.get('/download/pdf/:monthYear?', reportController.downloadPDF);
router.get('/download/json/:monthYear?', reportController.downloadJSON);

module.exports = router;
