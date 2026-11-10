const Income = require('./income.model');
const { paginateQuery, buildSortObject, parseMonthYear, toSmallestUnit, fromSmallestUnit, getCurrentMonthYear } = require('../../utils/helpers');

class IncomeService {
  async createIncome(userId, data) {
    const income = await Income.create({
      userId,
      amount: toSmallestUnit(data.amount),
      source: data.source || 'Salary',
      date: data.date || new Date(),
      note: data.note,
      paymentMethod: data.paymentMethod || 'bank_transfer',
      isRecurring: data.isRecurring || false,
      recurringId: data.recurringId || null,
    });
    return this.formatIncome(income);
  }

  async getIncomes(userId, filters = {}) {
    const query = { userId };

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (filters.monthYear) {
      const { startDate, endDate } = parseMonthYear(filters.monthYear);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (filters.source) query.source = filters.source;
    if (filters.search) {
      query.note = { $regex: filters.search, $options: 'i' };
    }

    const totalCount = await Income.countDocuments(query);
    const { skip, limit, pagination } = paginateQuery(filters, totalCount);
    const sort = buildSortObject(filters.sort, { date: -1 });

    const incomes = await Income.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      incomes: incomes.map(this.formatIncome),
      pagination,
    };
  }

  async getIncomeById(userId, incomeId) {
    const income = await Income.findOne({ _id: incomeId, userId });
    if (!income) throw new Error('Income not found.');
    return this.formatIncome(income);
  }

  async updateIncome(userId, incomeId, data) {
    const updates = {};
    if (data.amount !== undefined) updates.amount = toSmallestUnit(data.amount);
    if (data.source !== undefined) updates.source = data.source;
    if (data.date !== undefined) updates.date = data.date;
    if (data.note !== undefined) updates.note = data.note;
    if (data.paymentMethod !== undefined) updates.paymentMethod = data.paymentMethod;

    const income = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!income) throw new Error('Income not found.');
    return this.formatIncome(income);
  }

  async deleteIncome(userId, incomeId) {
    const income = await Income.findOneAndDelete({ _id: incomeId, userId });
    if (!income) throw new Error('Income not found.');
    return true;
  }

  async getIncomeSummary(userId, monthYear) {
    const target = monthYear || getCurrentMonthYear();
    const { startDate, endDate } = parseMonthYear(target);

    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    const summary = await Income.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = summary.reduce((acc, item) => acc + item.total, 0);

    return {
      monthYear: target,
      sources: summary.map((s) => ({
        source: s._id,
        total: s.total,
        totalInRupees: fromSmallestUnit(s.total),
        count: s.count,
        percentage: grandTotal > 0 ? Math.round((s.total / grandTotal) * 100) : 0,
      })),
      grandTotal,
      grandTotalInRupees: fromSmallestUnit(grandTotal),
    };
  }

  formatIncome(income) {
    const obj = income.toObject ? income.toObject() : income;
    return {
      ...obj,
      amountInRupees: fromSmallestUnit(obj.amount),
    };
  }
}

module.exports = new IncomeService();
