const Expense = require('./expense.model');
const Budget = require('../budgets/budget.model');
const Notification = require('../notifications/notification.model');
const { paginateQuery, buildSortObject, parseMonthYear, toSmallestUnit, fromSmallestUnit, getCurrentMonthYear } = require('../../utils/helpers');

class ExpenseService {
  async createExpense(userId, data) {
    const expenseData = {
      userId,
      amount: toSmallestUnit(data.amount),
      category: data.category,
      date: data.date || new Date(),
      note: data.note,
      paymentMethod: data.paymentMethod || 'cash',
      tags: data.tags || [],
      receiptPhoto: data.receiptPhoto || null,
      isRecurring: data.isRecurring || false,
      recurringId: data.recurringId || null,
    };

    const expense = await Expense.create(expenseData);
    await expense.populate('category', 'name icon color');

    // Check budget alert after adding expense
    await this.checkBudgetAlert(userId, data.category, data.date || new Date());

    return this.formatExpense(expense);
  }

  async getExpenses(userId, filters = {}) {
    const query = { userId };

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Month filter (e.g., "2024-01")
    if (filters.monthYear) {
      const { startDate, endDate } = parseMonthYear(filters.monthYear);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (filters.category) query.category = filters.category;
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
    if (filters.tags) query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
    if (filters.minAmount) query.amount = { ...query.amount, $gte: toSmallestUnit(filters.minAmount) };
    if (filters.maxAmount) query.amount = { ...query.amount, $lte: toSmallestUnit(filters.maxAmount) };

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const totalCount = await Expense.countDocuments(query);
    const { skip, limit, page, pagination } = paginateQuery(filters, totalCount);
    const sort = buildSortObject(filters.sort, { date: -1 });

    const expenses = await Expense.find(query)
      .populate('category', 'name icon color type')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      expenses: expenses.map(this.formatExpense),
      pagination,
    };
  }

  async getExpenseById(userId, expenseId) {
    const expense = await Expense.findOne({ _id: expenseId, userId }).populate('category', 'name icon color type');
    if (!expense) {
      const error = new Error('Expense not found.');
      error.statusCode = 404;
      throw error;
    }
    return this.formatExpense(expense);
  }

  async updateExpense(userId, expenseId, data) {
    const updates = {};
    if (data.amount !== undefined) updates.amount = toSmallestUnit(data.amount);
    if (data.category !== undefined) updates.category = data.category;
    if (data.date !== undefined) updates.date = data.date;
    if (data.note !== undefined) updates.note = data.note;
    if (data.paymentMethod !== undefined) updates.paymentMethod = data.paymentMethod;
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.receiptPhoto !== undefined) updates.receiptPhoto = data.receiptPhoto;

    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name icon color type');

    if (!expense) {
      const error = new Error('Expense not found.');
      error.statusCode = 404;
      throw error;
    }

    return this.formatExpense(expense);
  }

  async deleteExpense(userId, expenseId) {
    const expense = await Expense.findOneAndDelete({ _id: expenseId, userId });
    if (!expense) {
      const error = new Error('Expense not found.');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Expense deleted successfully.' };
  }

  async getExpenseSummary(userId, monthYear) {
    const target = monthYear || getCurrentMonthYear();
    const { startDate, endDate } = parseMonthYear(target);

    const summary = await Expense.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()), date: { $gte: startDate, $lte: endDate } } },
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
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmpty: true } },
      {
        $project: {
          category: { _id: 1, name: 1, icon: 1, color: 1 },
          total: 1,
          totalInRupees: { $divide: ['$total', 100] },
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = summary.reduce((acc, item) => acc + item.total, 0);

    return {
      monthYear: target,
      categories: summary.map((s) => ({
        ...s,
        percentage: grandTotal > 0 ? Math.round((s.total / grandTotal) * 100) : 0,
      })),
      grandTotal,
      grandTotalInRupees: fromSmallestUnit(grandTotal),
    };
  }

  async searchExpenses(userId, searchTerm, filters = {}) {
    const query = {
      userId,
      $text: { $search: searchTerm },
    };
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const totalCount = await Expense.countDocuments(query);
    const { skip, limit, pagination } = paginateQuery(filters, totalCount);

    const expenses = await Expense.find(query, { score: { $meta: 'textScore' } })
      .populate('category', 'name icon color')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    return { expenses: expenses.map(this.formatExpense), pagination };
  }

  async checkBudgetAlert(userId, categoryId, date) {
    try {
      const monthYear = `${date.getFullYear ? date.getFullYear() : new Date(date).getFullYear()}-${String((date.getMonth ? date.getMonth() : new Date(date).getMonth()) + 1).padStart(2, '0')}`;
      const budget = await Budget.findOne({ userId, category: categoryId, monthYear });
      if (!budget) return;

      const { startDate, endDate } = parseMonthYear(monthYear);
      const spentResult = await Expense.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()), category: require('mongoose').Types.ObjectId.createFromHexString(categoryId.toString()), date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = spentResult[0]?.total || 0;
      const percentSpent = (spent / budget.amount) * 100;

      if (percentSpent >= budget.alertAt && !budget.isAlertSent) {
        budget.isAlertSent = true;
        budget.spent = spent;
        await budget.save();

        await Notification.create({
          userId,
          type: 'budget_alert',
          title: 'Budget Alert!',
          message: `You have used ${Math.round(percentSpent)}% of your budget for this category.`,
        });
      } else {
        budget.spent = spent;
        await budget.save();
      }
    } catch (err) {
      console.error('Budget alert check failed:', err.message);
    }
  }

  formatExpense(expense) {
    const obj = expense.toObject ? expense.toObject() : expense;
    return {
      ...obj,
      amountInRupees: fromSmallestUnit(obj.amount),
    };
  }
}

module.exports = new ExpenseService();
