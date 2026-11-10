const express = require('express');
const router = express.Router();
const incomeController = require('./income.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.post('/', incomeController.createIncome);
router.get('/', incomeController.getIncomes);
router.get('/summary', incomeController.getIncomeSummary);
router.get('/:id', incomeController.getIncomeById);
router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
