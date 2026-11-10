const expenseService = require('./expense.service');

exports.createExpense = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      receiptPhoto: req.file ? `/uploads/${req.file.filename}` : req.body.receiptPhoto,
    };
    const expense = await expenseService.createExpense(req.user._id, data);
    res.status(201).json({ success: true, message: 'Expense created successfully', data: expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getExpenses(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.expenses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.user._id, req.params.id);
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };
    if (req.file) {
      data.receiptPhoto = `/uploads/${req.file.filename}`;
    }
    const expense = await expenseService.updateExpense(req.user._id, req.params.id, data);
    res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const result = await expenseService.deleteExpense(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

exports.getExpenseSummary = async (req, res, next) => {
  try {
    const summary = await expenseService.getExpenseSummary(req.user._id, req.query.monthYear);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

exports.searchExpenses = async (req, res, next) => {
  try {
    const { q, ...filters } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query "q" is required' });
    }
    const result = await expenseService.searchExpenses(req.user._id, q, filters);
    res.status(200).json({
      success: true,
      data: result.expenses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
