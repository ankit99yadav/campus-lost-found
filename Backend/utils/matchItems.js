const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendMatchNotificationEmail } = require('./emailTemplates');

/**
 * Smart item matching algorithm
 * Finds potential matches between lost and found items
 * based on category, keywords, date proximity, and location
 */
const findPotentialMatches = async (newItem) => {
  try {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';

    // Base query - same category, approved status
    const query = {
      type: oppositeType,
      status: 'approved',
      category: newItem.category,
      isActive: true,
      _id: { $ne: newItem._id },
    };

    // Date range - within 30 days of each other
    const dateRange = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    query.dateLostFound = {
      $gte: new Date(newItem.dateLostFound.getTime() - dateRange),
      $lte: new Date(newItem.dateLostFound.getTime() + dateRange),
    };

    const candidates = await Item.find(query).populate('reportedBy', 'name email notificationPreferences');

    const matches = [];

    for (const candidate of candidates) {
      const score = calculateMatchScore(newItem, candidate);
      if (score >= 40) { // Minimum 40% match score
        matches.push({ item: candidate, score });
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, 5); // Return top 5 matches
  } catch (error) {
    console.error('Match finding error:', error);
    return [];
  }
};

/**
 * Calculate match score between two items (0-100)
 */
const calculateMatchScore = (item1, item2) => {
  let score = 0;

  // Category match (already filtered, but weight it)
  score += 20;

  // Color match
  if (item1.color && item2.color) {
    if (item1.color.toLowerCase() === item2.color.toLowerCase()) {
      score += 20;
    } else if (
      item1.color.toLowerCase().includes(item2.color.toLowerCase()) ||
      item2.color.toLowerCase().includes(item1.color.toLowerCase())
    ) {
      score += 10;
    }
  }

  // Brand match
  if (item1.brand && item2.brand) {
    if (item1.brand.toLowerCase() === item2.brand.toLowerCase()) {
      score += 15;
    }
  }

  // Title keyword overlap
  const words1 = item1.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = item2.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const titleOverlap = words1.filter(w => words2.includes(w)).length;
  if (titleOverlap > 0) {
    score += Math.min(titleOverlap * 10, 25);
  }

  // Location match
  if (item1.location && item2.location) {
    if (
      item1.location.building &&
      item2.location.building &&
      item1.location.building.toLowerCase() === item2.location.building.toLowerCase()
    ) {
      score += 10;
    }
  }

  // Date proximity (closer dates = higher score)
  const daysDiff = Math.abs(
    (new Date(item1.dateLostFound) - new Date(item2.dateLostFound)) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff <= 1) score += 10;
  else if (daysDiff <= 7) score += 5;

  return Math.min(score, 100);
};

/**
 * Send match notifications to relevant users
 */
const sendMatchNotifications = async (newItem, matches, io) => {
  for (const { item: matchedItem, score } of matches) {
    try {
      // Determine who to notify
      const lostItem = newItem.type === 'lost' ? newItem : matchedItem;
      const foundItem = newItem.type === 'found' ? newItem : matchedItem;
      const userToNotify = lostItem.reportedBy;

      if (!userToNotify) continue;

      // Create in-app notification
      const notification = await Notification.create({
        recipient: userToNotify._id || userToNotify,
        type: 'item_match',
        title: '🎉 Possible Match Found!',
        message: `We found a ${score}% match for your lost "${lostItem.title}". A found item might be yours!`,
        data: {
          itemId: lostItem._id,
          matchedItemId: foundItem._id,
          extra: { matchScore: score },
        },
      });

      // Real-time notification via socket
      if (io) {
        io.to(`user_${userToNotify._id || userToNotify}`).emit('notification', {
          ...notification.toObject(),
          isNew: true,
        });
      }

      // Email notification (if user has it enabled)
      const user = await User.findById(userToNotify._id || userToNotify);
      if (user && user.notificationPreferences.email && user.notificationPreferences.matchAlerts) {
        await sendMatchNotificationEmail(user, lostItem, foundItem);
        await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
      }
    } catch (err) {
      console.error('Error sending match notification:', err);
    }
  }
};

module.exports = { findPotentialMatches, calculateMatchScore, sendMatchNotifications };
