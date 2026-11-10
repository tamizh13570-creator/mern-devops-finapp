const Budget = require('./budget.model');
const Expense = require('../expenses/expense.model');
const { parseMonthYear, getCurrentMonthYear, toSmallestUnit, fromSmallestUnit } = require('../../utils/helpers');

class BudgetService {
  async setBudget(userId, data) {
    const monthYear = data.monthYear || getCurrentMonthYear();
    const amountInPaise = toSmallestUnit(data.amount);

    let budget = await Budget.findOne({
      userId,
      category: data.category,
      monthYear,
    });

    if (budget) {
      budget.amount = amountInPaise;
      budget.alertAt = data.alertAt || budget.alertAt;
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        category: data.category,
        monthYear,
        amount: amountInPaise,
        alertAt: data.alertAt || 80,
      });
    }

    await budget.populate('category', 'name icon color');
    return this.enrichBudget(budget);
  }

  async getBudgets(userId, monthYear = getCurrentMonthYear()) {
    const { startDate, endDate } = parseMonthYear(monthYear);

    const budgets = await Budget.find({ userId, monthYear }).populate('category', 'name icon color');

    // Aggregate expenses for this month per category
    const expensesPerCategory = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = {};
    expensesPerCategory.forEach((e) => {
      spentMap[e._id.toString()] = e.totalSpent;
    });

    return budgets.map((b) => {
      const catId = b.category?._id?.toString() || b.category?.toString();
      const spentPaise = spentMap[catId] || 0;
      const budgetAmount = b.amount;
      const percentage = budgetAmount > 0 ? Math.round((spentPaise / budgetAmount) * 100) : 0;
      const remainingPaise = Math.max(0, budgetAmount - spentPaise);

      let status = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= b.alertAt) status = 'warning';

      return {
        _id: b._id,
        category: b.category,
        monthYear: b.monthYear,
        budgetAmount: fromSmallestUnit(budgetAmount),
        spent: fromSmallestUnit(spentPaise),
        remaining: fromSmallestUnit(remainingPaise),
        percentage,
        alertAt: b.alertAt,
        status,
      };
    });
  }

  async enrichBudget(budget) {
    const { startDate, endDate } = parseMonthYear(budget.monthYear);
    const spentAgg = await Expense.aggregate([
      {
        $match: {
          userId: budget.userId,
          category: budget.category._id || budget.category,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spentPaise = spentAgg[0]?.total || 0;
    const percentage = budget.amount > 0 ? Math.round((spentPaise / budget.amount) * 100) : 0;
    const remainingPaise = Math.max(0, budget.amount - spentPaise);

    let status = 'safe';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= budget.alertAt) status = 'warning';

    return {
      _id: budget._id,
      category: budget.category,
      monthYear: budget.monthYear,
      budgetAmount: fromSmallestUnit(budget.amount),
      spent: fromSmallestUnit(spentPaise),
      remaining: fromSmallestUnit(remainingPaise),
      percentage,
      alertAt: budget.alertAt,
      status,
    };
  }

  async deleteBudget(id, userId) {
    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    if (!budget) throw new Error('Budget not found');
    return true;
  }
}

module.exports = new BudgetService();
