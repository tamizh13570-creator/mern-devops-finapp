const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means global/system category
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    icon: {
      type: String,
      default: '🏷️',
    },
    color: {
      type: String,
      default: '#667eea',
    },
    type: {
      type: String,
      enum: ['expense', 'income', 'both'],
      default: 'expense',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category names for same user
categorySchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Category', categorySchema);
