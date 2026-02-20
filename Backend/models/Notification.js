const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'item_match',        // Possible match found
        'item_claimed',      // Someone claimed your item
        'item_approved',     // Admin approved your item
        'item_rejected',     // Admin rejected your item
        'item_resolved',     // Item has been resolved
        'new_message',       // New chat message
        'token_reward',      // Token reward received
        'claim_verified',    // Claim has been verified
        'system',            // System notification
        'item_dispute',      // Dispute raised
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      matchedItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      tokens: Number,
      extra: mongoose.Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    // Push notification status
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
