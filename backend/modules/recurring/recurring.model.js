const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      comment: 'In paise',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    source: {
      type: String, // For income type (e.g. Salary, Rental)
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'upi',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastProcessed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recurring', recurringSchema);
