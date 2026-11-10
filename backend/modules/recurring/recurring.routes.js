const express = require('express');
const router = express.Router();
const recurringController = require('./recurring.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.post('/', recurringController.createRecurring);
router.get('/', recurringController.getRecurring);
router.patch('/:id/toggle', recurringController.toggleActive);
router.delete('/:id', recurringController.deleteRecurring);
router.post('/process', recurringController.triggerProcess);

module.exports = router;
