const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const TokenTransaction = require('../models/TokenTransaction');
const { findPotentialMatches, sendMatchNotifications } = require('../utils/matchItems');

// @desc    Create item report (lost or found)
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const {
      type, title, description, category, color, brand,
      location, dateLostFound, timeLostFound, contactPreference,
      tokenReward, tags,
    } = req.body;

    if (!type || !title || !description || !category || !dateLostFound) {
      return res.status(400).json({ success: false, message: 'Type, title, description, category, and date are required.' });
    }

    // Process uploaded images
    const images = req.files
      ? req.files
        .filter((file) => file.path && file.filename)
        .map((file) => ({ url: file.path, public_id: file.filename }))
      : [];

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags || '[]') : tags || [];

    const item = await Item.create({
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      color: color || '',
      brand: brand || '',
      images,
      location: parsedLocation || {},
      dateLostFound: new Date(dateLostFound),
      timeLostFound: timeLostFound || '',
      reportedBy: req.user._id,
      contactPreference: contactPreference || 'chat',
      tokenReward: type === 'found' ? (parseInt(tokenReward) || 10) : 0,
      tags: parsedTags,
      status: 'pending',
    });

    const populatedItem = await Item.findById(item._id).populate('reportedBy', 'name email avatar');

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    const io = req.app.get('io');

    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        type: 'system',
        title: `📋 New ${type.charAt(0).toUpperCase() + type.slice(1)} Item Report`,
        message: `${req.user.name} reported a ${type} item: "${title}". Review and approve.`,
        data: { itemId: item._id, userId: req.user._id },
      });
      if (io) io.to(`user_${admin._id}`).emit('notification', notification);
    }

    // Find potential matches asynchronously
    setTimeout(async () => {
      try {
        const approvedItem = await Item.findById(item._id).populate('reportedBy', 'name email notificationPreferences');
        const matches = await findPotentialMatches(approvedItem);
        if (matches.length > 0) {
          await sendMatchNotifications(approvedItem, matches, io);
        }
      } catch (err) {
        console.error('Background match finding error:', err);
      }
    }, 2000);

    res.status(201).json({
      success: true,
      message: `Your ${type} item has been submitted and is pending admin approval.`,
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items with filters
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const {
      type, category, status, search, location, dateFrom, dateTo,
      page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc',
      myItems,
    } = req.query;

    const query = { isActive: true };

    // Filter by type
    if (type && ['lost', 'found'].includes(type)) query.type = type;

    // Filter by category
    if (category) query.category = category;

    // Filter by status
    // - myItems=true: strictly user's own items (any status or requested status)
    // - normal browse (authenticated): show public approved items + user's own items
    // - normal browse (guest): show only approved items
    if (myItems && req.user) {
      query.reportedBy = req.user._id;
      if (status) query.status = status;
    } else if (req.user) {
      if (status) {
        if (status === 'approved') {
          query.status = 'approved';
        } else {
          query.$or = [
            { status, reportedBy: req.user._id },
          ];
        }
      } else {
        query.$or = [
          { status: 'approved' },
          { reportedBy: req.user._id },
        ];
      }
    } else {
      query.status = 'approved';
    }

    // Location filter
    if (location) {
      query['location.building'] = { $regex: location, $options: 'i' };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.dateLostFound = {};
      if (dateFrom) query.dateLostFound.$gte = new Date(dateFrom);
      if (dateTo) query.dateLostFound.$lte = new Date(dateTo);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('reportedBy', 'name avatar department')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: items.length,
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name avatar department phone email')
      .populate('matchedWith', 'title type status');

    if (!item || !item.isActive) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Increment views
    await Item.findByIdAndUpdate(item._id, { $inc: { views: 1 } });

    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (owner only)
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item.' });
    }

    const allowedUpdates = ['title', 'description', 'color', 'brand', 'location', 'contactPreference', 'tags', 'timeLostFound'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files
        .filter((file) => file.path && file.filename)
        .map((f) => ({ url: f.path, public_id: f.filename }));
      updates.images = [...item.images, ...newImages].slice(0, 5); // max 5 images
    }

    // Re-approve if edited
    if (req.user.role !== 'admin') {
      updates.status = 'pending';
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    }).populate('reportedBy', 'name avatar');

    res.json({ success: true, message: 'Item updated successfully.', item: updatedItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (owner or admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Soft delete
    await Item.findByIdAndUpdate(req.params.id, { isActive: false });

    // Delete images from cloudinary
    const { cloudinary } = require('../config/cloudinary');
    for (const img of item.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id).catch(console.error);
    }

    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim an item (someone claiming a found item as theirs, or someone saying they found a lost item)
// @route   POST /api/items/:id/claim
// @access  Private
const claimItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'This item is not available for claiming.' });
    }

    if (item.reportedBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own reported item.' });
    }

    // Mark as claimed (pending verification)
    await Item.findByIdAndUpdate(item._id, {
      claimedBy: req.user._id,
      claimedAt: new Date(),
    });

    // Notify the reporter
    const io = req.app.get('io');
    const claimMsg = item.type === 'found'
      ? `${req.user.name} claims "${item.title}" belongs to them. Please verify and resolve.`
      : `${req.user.name} says they found your lost item "${item.title}". Please verify and resolve.`;
    const claimTitle = item.type === 'found'
      ? '📦 Someone Claimed Your Found Item!'
      : '🔍 Someone Found Your Lost Item!';
    const notification = await Notification.create({
      recipient: item.reportedBy._id,
      type: 'item_claimed',
      title: claimTitle,
      message: claimMsg,
      data: { itemId: item._id, userId: req.user._id },
    });

    if (io) io.to(`user_${item.reportedBy._id}`).emit('notification', notification);

    const successMsg = item.type === 'found'
      ? 'Claim submitted! The finder will verify and contact you.'
      : 'You notified the owner that you found their item!';
    res.json({ success: true, message: successMsg });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve item (mark as returned)
// @route   POST /api/items/:id/resolve
// @access  Private (owner of report)
const resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('claimedBy', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isClaimer = item.claimedBy && item.claimedBy.toString() === req.user._id.toString();
    if (!isReporter && !isClaimer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await Item.findByIdAndUpdate(item._id, { status: 'resolved' });

    const io = req.app.get('io');

    // If it's a found item resolved, reward the finder with tokens
    if (item.type === 'found' && item.claimedBy && item.tokenReward > 0) {
      const finder = await User.findById(item.reportedBy);
      if (finder) {
        finder.tokenBalance += item.tokenReward;
        finder.totalTokensEarned += item.tokenReward;
        await finder.save({ validateBeforeSave: false });

        await TokenTransaction.create({
          user: finder._id,
          type: 'earned',
          amount: item.tokenReward,
          description: `Token reward for returning "${item.title}"`,
          relatedItem: item._id,
          balanceAfter: finder.tokenBalance,
        });

        // Notify finder of token reward
        const tokenNotification = await Notification.create({
          recipient: finder._id,
          type: 'token_reward',
          title: `🏅 You earned ${item.tokenReward} tokens!`,
          message: `Thank you for returning "${item.title}"! You have been rewarded ${item.tokenReward} tokens.`,
          data: { itemId: item._id, tokens: item.tokenReward },
        });
        await Item.findByIdAndUpdate(item._id, { rewardClaimed: true });
        if (io) io.to(`user_${finder._id}`).emit('notification', tokenNotification);
      }
    }

    // Notify the claimant (item owner) of resolution
    if (item.claimedBy) {
      const ackNotification = await Notification.create({
        recipient: item.claimedBy._id || item.claimedBy,
        type: 'claim_verified',
        title: '✅ Item Return Acknowledged!',
        message: `Your claim for "${item.title}" has been verified and resolved. We hope you got your item back!`,
        data: { itemId: item._id },
      });
      if (io) io.to(`user_${item.claimedBy._id || item.claimedBy}`).emit('notification', ackNotification);
    }

    res.json({ success: true, message: 'Item marked as resolved successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get item categories
// @route   GET /api/items/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = [
    'Electronics', 'Books & Stationery', 'Clothing & Accessories',
    'ID Cards & Documents', 'Keys', 'Bags & Wallets', 'Jewellery',
    'Sports Equipment', 'Musical Instruments', 'Other',
  ];
  res.json({ success: true, categories });
};

// @desc    Get stats
// @route   GET /api/items/stats
// @access  Public
const getStats = async (req, res, next) => {
  try {
    const [activeReports, resolvedItems, activeUsersCount] = await Promise.all([
      // Items Reported = pending + approved (not yet resolved)
      Item.countDocuments({ status: { $in: ['pending', 'approved'] }, isActive: true }),
      // Items Resolved
      Item.countDocuments({ status: 'resolved', isActive: true }),
      // Active Users
      Item.distinct('reportedBy', { isActive: true }).then(users => users.length),
    ]);

    res.json({
      success: true,
      stats: {
        totalItems: activeReports,
        resolvedItems,
        activeUsers: activeUsersCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem, getItems, getItem, updateItem, deleteItem,
  claimItem, resolveItem, getCategories, getStats,
};
