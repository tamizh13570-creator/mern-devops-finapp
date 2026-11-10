const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1 (in paise)'],
      comment: 'Stored in paise (1 INR = 100 paise)',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'wallet', 'other'],
      default: 'cash',
    },
    tags: {
      type: [String],
      default: [],
    },
    receiptPhoto: {
      type: String,
      default: null,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recurring',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

// Text index for search
expenseSchema.index({ note: 'text', tags: 'text' });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
