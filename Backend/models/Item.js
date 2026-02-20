const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Item type (lost/found) is required'],
    },
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Books & Stationery',
        'Clothing & Accessories',
        'ID Cards & Documents',
        'Keys',
        'Bags & Wallets',
        'Jewellery',
        'Sports Equipment',
        'Musical Instruments',
        'Other',
      ],
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    images: [imageSchema],
    // Location details
    location: {
      building: { type: String, trim: true, default: '' },
      floor: { type: String, trim: true, default: '' },
      area: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
    },
    // Date and time
    dateLostFound: {
      type: Date,
      required: [true, 'Date when item was lost/found is required'],
    },
    timeLostFound: {
      type: String,
      default: '',
    },
    // Reporter
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'resolved', 'rejected', 'disputed'],
      default: 'pending',
    },
    // Admin
    adminNotes: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    // Claim/match
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    claimedAt: Date,
    matchedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    // Contact
    contactPreference: {
      type: String,
      enum: ['chat', 'email', 'phone'],
      default: 'chat',
    },
    // Token reward (only for found items)
    tokenReward: {
      type: Number,
      default: 0,
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    // Visibility
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    // Tags for better search
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for full-text search
itemSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
  'location.building': 'text',
  'location.area': 'text',
});

// Regular indexes for filters
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ reportedBy: 1 });
itemSchema.index({ dateLostFound: -1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
