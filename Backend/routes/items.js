const express = require('express');
const router = express.Router();
const {
  createItem, getItems, getItem, updateItem, deleteItem,
  claimItem, resolveItem, getCategories, getStats,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadItemImages } = require('../config/cloudinary');

// Public routes
router.get('/categories', getCategories);
router.get('/stats', getStats);
router.get('/', optionalAuth, getItems);
router.get('/:id', optionalAuth, getItem);

// Protected routes
router.use(protect);
router.post('/', uploadItemImages.array('images', 5), createItem);
router.put('/:id', uploadItemImages.array('images', 5), updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/claim', claimItem);
router.post('/:id/resolve', resolveItem);

module.exports = router;
