const mongoose = require('mongoose');

const tokenTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['earned', 'spent', 'admin_grant', 'admin_deduct'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

tokenTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TokenTransaction', tokenTransactionSchema);
