const Recurring = require('./recurring.model');
const Expense = require('../expenses/expense.model');
const Income = require('../income/income.model');
const Notification = require('../notifications/notification.model');
const { toSmallestUnit, fromSmallestUnit } = require('../../utils/helpers');

class RecurringService {
  async createRecurring(userId, data) {
    const nextDueDate = data.startDate ? new Date(data.startDate) : new Date();

    const recurring = await Recurring.create({
      userId,
      type: data.type || 'expense',
      amount: toSmallestUnit(data.amount),
      category: data.category || null,
      source: data.source || 'Other',
      frequency: data.frequency || 'monthly',
      startDate: data.startDate || new Date(),
      nextDueDate,
      endDate: data.endDate || null,
      note: data.note,
      paymentMethod: data.paymentMethod || 'upi',
      isActive: true,
    });

    return this.formatRecurring(await recurring.populate('category', 'name icon color'));
  }

  async getRecurring(userId) {
    const items = await Recurring.find({ userId })
      .populate('category', 'name icon color')
      .sort({ nextDueDate: 1 });
    return items.map(this.formatRecurring);
  }

  async toggleActive(userId, id) {
    const item = await Recurring.findOne({ _id: id, userId });
    if (!item) throw new Error('Recurring rule not found');
    item.isActive = !item.isActive;
    await item.save();
    return this.formatRecurring(item);
  }

  async deleteRecurring(userId, id) {
    const item = await Recurring.findOneAndDelete({ _id: id, userId });
    if (!item) throw new Error('Recurring rule not found');
    return true;
  }

  // Calculate next date given frequency
  computeNextDate(currentDate, frequency) {
    const next = new Date(currentDate);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  // Process all due recurring transactions (called by daily cron)
  async processDueTransactions() {
    const now = new Date();
    const dueItems = await Recurring.find({
      isActive: true,
      nextDueDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    });

    console.log(`Processing ${dueItems.length} due recurring items...`);

    for (const item of dueItems) {
      try {
        if (item.type === 'expense') {
          await Expense.create({
            userId: item.userId,
            amount: item.amount,
            category: item.category,
            date: item.nextDueDate,
            note: `Recurring: ${item.note || 'Scheduled Expense'}`,
            paymentMethod: item.paymentMethod,
            isRecurring: true,
            recurringId: item._id,
          });
        } else {
          await Income.create({
            userId: item.userId,
            amount: item.amount,
            source: item.source || 'Other',
            date: item.nextDueDate,
            note: `Recurring: ${item.note || 'Scheduled Income'}`,
            paymentMethod: item.paymentMethod,
            isRecurring: true,
            recurringId: item._id,
          });
        }

        item.lastProcessed = new Date();
        item.nextDueDate = this.computeNextDate(item.nextDueDate, item.frequency);

        if (item.endDate && item.nextDueDate > item.endDate) {
          item.isActive = false;
        }

        await item.save();

        await Notification.create({
          userId: item.userId,
          type: 'recurring_reminder',
          title: `Recurring ${item.type === 'expense' ? 'Expense' : 'Income'} Processed`,
          message: `₹${fromSmallestUnit(item.amount)} for "${item.note || item.type}" was automatically recorded.`,
        });
      } catch (err) {
        console.error(`Failed to process recurring item ${item._id}:`, err.message);
      }
    }
  }

  formatRecurring(item) {
    const obj = item.toObject ? item.toObject() : item;
    return {
      ...obj,
      amountInRupees: fromSmallestUnit(obj.amount),
    };
  }
}

module.exports = new RecurringService();
