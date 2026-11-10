const express = require('express');
const router = express.Router();
const expenseController = require('./expense.controller');
const { authenticate } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');

router.use(authenticate);

router.post('/', upload.single('receiptPhoto'), expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getExpenseSummary);
router.get('/search', expenseController.searchExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', upload.single('receiptPhoto'), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
