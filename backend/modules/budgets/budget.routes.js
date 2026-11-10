const express = require('express');
const router = express.Router();
const budgetController = require('./budget.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.post('/', budgetController.setBudget);
router.get('/', budgetController.getBudgets);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
