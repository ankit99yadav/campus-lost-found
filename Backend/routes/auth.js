const express = require('express');
const router = express.Router();
const {
  register, verifyEmail, resendOTP, login, forgotPassword,
  verifyResetOTP, resetPassword, getMe, updateProfile,
  changePassword, uploadAvatar, logout, refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../config/cloudinary');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/update-profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/upload-avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.post('/logout', logout);

module.exports = router;
