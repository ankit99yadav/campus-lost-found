const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const TokenTransaction = require('../models/TokenTransaction');
const { protect } = require('../middleware/auth');

// @desc    Get currently logged-in user's items (all statuses)
// @route   GET /api/users/me/items
// @access  Private
router.get('/me/items', protect, async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('claimedBy', 'name avatar')
      .lean();
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// @desc    Update my profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'department', 'rollNumber'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user public profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar department tokenBalance totalTokensEarned createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's public items
// @route   GET /api/users/:id/items
// @access  Public
router.get('/:id/items', async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { reportedBy: req.params.id, status: 'approved', isActive: true };
    if (type) query.type = type;

    const items = await Item.find(query).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// @desc    Get token history
// @route   GET /api/users/tokens/history
// @access  Private
router.get('/tokens/history', protect, async (req, res, next) => {
  try {
    const transactions = await TokenTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('relatedItem', 'title type');
    res.json({ success: true, transactions, balance: req.user.tokenBalance });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
