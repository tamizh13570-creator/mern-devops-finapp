const budgetService = require('./budget.service');

exports.setBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.setBudget(req.user._id, req.body);
    res.status(200).json({ success: true, message: 'Budget set successfully', data: budget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBudgets = async (req, res, next) => {
  try {
    const { monthYear } = req.query;
    const budgets = await budgetService.getBudgets(req.user._id, monthYear);
    res.status(200).json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
