const recurringService = require('./recurring.service');

exports.createRecurring = async (req, res, next) => {
  try {
    const item = await recurringService.createRecurring(req.user._id, req.body);
    res.status(201).json({ success: true, message: 'Recurring transaction scheduled', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRecurring = async (req, res, next) => {
  try {
    const items = await recurringService.getRecurring(req.user._id);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const item = await recurringService.toggleActive(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Status updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRecurring = async (req, res, next) => {
  try {
    await recurringService.deleteRecurring(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Recurring rule deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.triggerProcess = async (req, res, next) => {
  try {
    await recurringService.processDueTransactions();
    res.status(200).json({ success: true, message: 'Due recurring transactions processed' });
  } catch (error) {
    next(error);
  }
};
