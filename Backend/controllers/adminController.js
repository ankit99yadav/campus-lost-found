const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const TokenTransaction = require('../models/TokenTransaction');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers, bannedUsers,
      totalItems, pendingItems, approvedItems, resolvedItems,
      lostItems, foundItems,
      totalNotifications,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isBanned: false }),
      User.countDocuments({ isBanned: true }),
      Item.countDocuments({ isActive: true }),
      Item.countDocuments({ status: 'pending', isActive: true }),
      Item.countDocuments({ status: 'approved', isActive: true }),
      Item.countDocuments({ status: 'resolved', isActive: true }),
      Item.countDocuments({ type: 'lost', isActive: true }),
      Item.countDocuments({ type: 'found', isActive: true }),
      Notification.countDocuments(),
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentUsers, recentItems] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Item.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers, recentNew: recentUsers },
        items: {
          total: totalItems, pending: pendingItems, approved: approvedItems,
          resolved: resolvedItems, lost: lostItems, found: foundItems, recentNew: recentItems,
        },
        notifications: totalNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status === 'banned') query.isBanned = true;
    else if (status === 'active') query.isBanned = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true, users,
      pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), totalUsers: total },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
// @access  Admin
const toggleBanUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot ban an admin user.' });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? (reason || 'Policy violation') : '';
    await user.save({ validateBeforeSave: false });

    // Notify user
    await Notification.create({
      recipient: user._id,
      type: 'system',
      title: user.isBanned ? '🚫 Account Suspended' : '✅ Account Restored',
      message: user.isBanned
        ? `Your account has been suspended. Reason: ${user.banReason}`
        : 'Your account has been restored. You can now use Campus Lost & Found.',
    });

    const io = req.app.get('io');
    if (io) io.to(`user_${user._id}`).emit('account_status', { isBanned: user.isBanned });

    res.json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully.`,
      user: { _id: user._id, name: user.name, isBanned: user.isBanned },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items for admin
// @route   GET /api/admin/items
// @access  Admin
const getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = { isActive: true };

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('reportedBy', 'name email avatar rollNumber')
        .populate('verifiedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(query),
    ]);

    res.json({
      success: true, items,
      pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), totalItems: total },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve item
// @route   PATCH /api/admin/items/:id/approve
// @access  Admin
const approveItem = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email notificationPreferences');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    await Item.findByIdAndUpdate(item._id, {
      status: 'approved',
      adminNotes: adminNotes || '',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
    });

    // Notify reporter
    const io = req.app.get('io');
    const notification = await Notification.create({
      recipient: item.reportedBy._id,
      type: 'item_approved',
      title: '✅ Your Item Report is Approved!',
      message: `Your ${item.type} item report "${item.title}" has been approved and is now visible to everyone.`,
      data: { itemId: item._id },
    });

    if (io) io.to(`user_${item.reportedBy._id}`).emit('notification', notification);

    // Run match finding after approval
    const { findPotentialMatches, sendMatchNotifications } = require('../utils/matchItems');
    const fullItem = await Item.findById(item._id).populate('reportedBy', 'name email notificationPreferences');
    const matches = await findPotentialMatches(fullItem);
    if (matches.length > 0) {
      await sendMatchNotifications(fullItem, matches, io);
    }

    res.json({ success: true, message: 'Item approved successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject item
// @route   PATCH /api/admin/items/:id/reject
// @access  Admin
const rejectItem = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    await Item.findByIdAndUpdate(item._id, {
      status: 'rejected',
      adminNotes: reason || 'Does not meet community guidelines',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
    });

    const io = req.app.get('io');
    const notification = await Notification.create({
      recipient: item.reportedBy._id,
      type: 'item_rejected',
      title: '❌ Item Report Rejected',
      message: `Your ${item.type} item report "${item.title}" was rejected. Reason: ${reason || 'Does not meet guidelines'}`,
      data: { itemId: item._id },
    });

    if (io) io.to(`user_${item.reportedBy._id}`).emit('notification', notification);

    res.json({ success: true, message: 'Item rejected.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item as disputed
// @route   PATCH /api/admin/items/:id/dispute
// @access  Admin
const disputeItem = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'disputed', adminNotes: reason || '' },
      { new: true }
    ).populate('reportedBy', 'name');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const io = req.app.get('io');
    const notification = await Notification.create({
      recipient: item.reportedBy._id,
      type: 'item_dispute',
      title: '⚠️ Item Under Dispute',
      message: `Your item "${item.title}" has been flagged for dispute. Please check the admin notes.`,
      data: { itemId: item._id },
    });

    if (io) io.to(`user_${item.reportedBy._id}`).emit('notification', notification);

    res.json({ success: true, message: 'Item marked as disputed.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send system-wide notification
// @route   POST /api/admin/notify-all
// @access  Admin
const notifyAllUsers = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const users = await User.find({ role: 'student', isBanned: false }).select('_id');
    const notifications = users.map(u => ({
      recipient: u._id,
      type: 'system',
      title,
      message,
    }));

    await Notification.insertMany(notifications);

    const io = req.app.get('io');
    if (io) {
      for (const u of users) {
        io.to(`user_${u._id}`).emit('notification', { type: 'system', title, message });
      }
    }

    res.json({ success: true, message: `Notification sent to ${users.length} users.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Grant tokens to user
// @route   POST /api/admin/users/:id/tokens
// @access  Admin
const grantTokens = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid token amount is required.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.tokenBalance += parseInt(amount);
    user.totalTokensEarned += parseInt(amount);
    await user.save({ validateBeforeSave: false });

    await TokenTransaction.create({
      user: user._id,
      type: 'admin_grant',
      amount: parseInt(amount),
      description: reason || 'Admin token grant',
      balanceAfter: user.tokenBalance,
    });

    const io = req.app.get('io');
    const notification = await Notification.create({
      recipient: user._id,
      type: 'token_reward',
      title: `🏅 You received ${amount} tokens!`,
      message: reason || `Admin granted you ${amount} tokens.`,
      data: { tokens: amount },
    });

    if (io) io.to(`user_${user._id}`).emit('notification', notification);

    res.json({ success: true, message: `${amount} tokens granted to ${user.name}.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats, getAllUsers, toggleBanUser, getAllItems,
  approveItem, rejectItem, disputeItem, notifyAllUsers, grantTokens,
};
