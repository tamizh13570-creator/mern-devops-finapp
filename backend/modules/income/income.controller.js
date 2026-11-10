const incomeService = require('./income.service');

exports.createIncome = async (req, res, next) => {
  try {
    const income = await incomeService.createIncome(req.user._id, req.body);
    res.status(201).json({ success: true, message: 'Income logged successfully', data: income });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIncomes = async (req, res, next) => {
  try {
    const result = await incomeService.getIncomes(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.incomes,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

exports.getIncomeById = async (req, res, next) => {
  try {
    const income = await incomeService.getIncomeById(req.user._id, req.params.id);
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const income = await incomeService.updateIncome(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Income updated successfully', data: income });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    await incomeService.deleteIncome(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIncomeSummary = async (req, res, next) => {
  try {
    const summary = await incomeService.getIncomeSummary(req.user._id, req.query.monthYear);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
