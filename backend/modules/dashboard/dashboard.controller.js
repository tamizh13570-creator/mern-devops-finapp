const Expense = require('../expenses/expense.model');
const Income = require('../income/income.model');
const Budget = require('../budgets/budget.model');
const budgetService = require('../budgets/budget.service');
const { parseMonthYear, getCurrentMonthYear, fromSmallestUnit } = require('../../utils/helpers');
const mongoose = require('mongoose');

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());
    const monthYear = req.query.monthYear || getCurrentMonthYear();
    const { startDate, endDate } = parseMonthYear(monthYear);

    // 1. Current Month Expenses
    const expenseAgg = await Expense.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalSpentPaise = expenseAgg[0]?.total || 0;
    const expenseCount = expenseAgg[0]?.count || 0;

    // 2. Current Month Income
    const incomeAgg = await Income.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalIncomePaise = incomeAgg[0]?.total || 0;
    const incomeCount = incomeAgg[0]?.count || 0;

    const totalSpent = fromSmallestUnit(totalSpentPaise);
    const totalIncome = fromSmallestUnit(totalIncomePaise);
    const savings = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // 3. Category Breakdown for Pie Chart
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: { path: '$cat', preserveNullAndEmpty: true } },
      {
        $project: {
          categoryId: '$_id',
          name: { $ifNull: ['$cat.name', 'Uncategorized'] },
          icon: { $ifNull: ['$cat.icon', '🏷️'] },
          color: { $ifNull: ['$cat.color', '#667eea'] },
          amount: { $divide: ['$total', 100] },
          count: 1,
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // 4. Last 6 Months Trend (Income vs Expense)
    const monthlyTrends = [];
    const now = new Date(startDate);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const { startDate: mStart, endDate: mEnd } = parseMonthYear(mYear);

      const mExp = await Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: mStart, $lte: mEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const mInc = await Income.aggregate([
        { $match: { userId: userObjectId, date: { $gte: mStart, $lte: mEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyTrends.push({
        monthYear: mYear,
        month: `${monthName} ${d.getFullYear().toString().slice(-2)}`,
        expense: fromSmallestUnit(mExp[0]?.total || 0),
        income: fromSmallestUnit(mInc[0]?.total || 0),
      });
    }

    // 5. Recent 5 Transactions (Expenses + Incomes combined)
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .populate('category', 'name icon color')
      .lean();

    const recentIncomes = await Income.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const combinedRecent = [
      ...recentExpenses.map((e) => ({
        _id: e._id,
        type: 'expense',
        title: e.category?.name || 'Expense',
        subtitle: e.note || e.paymentMethod,
        icon: e.category?.icon || '💸',
        color: e.category?.color || '#dc3545',
        amount: fromSmallestUnit(e.amount),
        date: e.date,
      })),
      ...recentIncomes.map((i) => ({
        _id: i._id,
        type: 'income',
        title: i.source,
        subtitle: i.note || i.paymentMethod,
        icon: '💰',
        color: '#28a745',
        amount: fromSmallestUnit(i.amount),
        date: i.date,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    // 6. Budgets overview
    const budgets = await budgetService.getBudgets(userId, monthYear);

    res.status(200).json({
      success: true,
      data: {
        monthYear,
        summary: {
          totalSpent,
          totalIncome,
          savings,
          savingsRate,
          expenseCount,
          incomeCount,
          currency: req.user.currency || 'INR',
        },
        categoryBreakdown,
        monthlyTrends,
        recentTransactions: combinedRecent,
        budgets,
      },
    });
  } catch (error) {
    next(error);
  }
};
