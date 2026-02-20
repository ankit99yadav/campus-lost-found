const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, toggleBanUser, getAllItems,
  approveItem, rejectItem, disputeItem, notifyAllUsers, grantTokens,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', toggleBanUser);
router.post('/users/:id/tokens', grantTokens);
router.get('/items', getAllItems);
router.patch('/items/:id/approve', approveItem);
router.patch('/items/:id/reject', rejectItem);
router.patch('/items/:id/dispute', disputeItem);
router.post('/notify-all', notifyAllUsers);

module.exports = router;
