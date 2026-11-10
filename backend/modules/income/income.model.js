const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
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
    source: {
      type: String,
      required: [true, 'Income source is required'],
      enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gifts', 'Other'],
      default: 'Salary',
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
      enum: ['bank_transfer', 'cash', 'cheque', 'upi', 'other'],
      default: 'bank_transfer',
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

module.exports = mongoose.model('Income', incomeSchema);
