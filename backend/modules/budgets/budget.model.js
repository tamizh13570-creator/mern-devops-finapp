const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    monthYear: {
      type: String, // e.g. "2026-11"
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Budget must be at least 1 (in paise)'],
      comment: 'Stored in paise',
    },
    alertAt: {
      type: Number,
      default: 80, // percentage 80%
      min: 10,
      max: 100,
    },
    isAlertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ userId: 1, category: 1, monthYear: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
