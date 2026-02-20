const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendOTPEmail } = require('../utils/emailTemplates');

const isDev = () => process.env.NODE_ENV === 'development';

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  user.save({ validateBeforeSave: false });

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    department: user.department,
    rollNumber: user.rollNumber,
    isEmailVerified: user.isEmailVerified,
    tokenBalance: user.tokenBalance,
    notificationPreferences: user.notificationPreferences,
  };

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: userObj,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, rollNumber, adminCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    let role = 'student';
    if (adminCode && adminCode === process.env.ADMIN_SECRET_CODE) {
      role = 'admin';
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      department: department || '',
      rollNumber: rollNumber || '',
      role,
      // OTP/email verification removed: treat new accounts as verified.
      isEmailVerified: true,
    });

    await user.save();

    // Welcome notification
    await Notification.create({
      recipient: user._id,
      type: 'system',
      title: '🎉 Welcome to Campus Lost & Found!',
      message: 'Your account is ready. Start reporting lost or found items to help your campus community!',
    });

    // Direct login after registration
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
    }

    const user = await User.findById(userId).select('+emailOTP +password +refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    if (!user.verifyOTP(otp, 'email')) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    await user.save({ validateBeforeSave: false });

    // Welcome notification
    await Notification.create({
      recipient: user._id,
      type: 'system',
      title: '🎉 Welcome to Campus Lost & Found!',
      message: 'Your account is verified. Start reporting lost or found items to help your campus community!',
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { userId, type } = req.body;
    const user = await User.findById(userId).select('+emailOTP +resetPasswordOTP');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const otpType = type || 'email';
    if (otpType === 'email' && user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    const otp = user.generateOTP(otpType);
    await user.save({ validateBeforeSave: false });

    const otpExpiresAt = (otpType === 'email' ? user.emailOTP?.expiry : user.resetPasswordOTP?.expiry);

    try {
      await sendOTPEmail(user, otp, otpType);
    } catch (emailErr) {
      console.warn('⚠️  Failed to resend OTP email:', emailErr.message);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 [DEV] OTP for ${user.email}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP resent successfully. Check your email.',
      ...(isDev() && { devOtp: otp, devOtpExpiresAt: otpExpiresAt }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken +emailOTP +resetPasswordOTP');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Account banned: ${user.banReason}` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOTP');
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If an account with this email exists, you will receive a password reset OTP.' });
    }

    const otp = user.generateOTP('reset');
    await user.save({ validateBeforeSave: false });

    const otpExpiresAt = user.resetPasswordOTP?.expiry;

    try {
      await sendOTPEmail(user, otp, 'reset');
    } catch (emailErr) {
      console.warn('⚠️  Failed to send reset OTP email:', emailErr.message);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 [DEV] Reset OTP for ${user.email}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email.',
      userId: user._id,
      email: user.email,

      ...(isDev() && { devOtp: otp, devOtpExpiresAt: otpExpiresAt }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+resetPasswordOTP');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!user.verifyOTP(otp, 'reset')) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Generate a temporary reset token
    const resetToken = require('jsonwebtoken').sign(
      { id: user._id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, message: 'OTP verified.', resetToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    const decoded = require('jsonwebtoken').verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.id).select('+resetPasswordOTP +password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset session expired. Please request a new OTP.' });
    }
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, rollNumber, notificationPreferences } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;
    if (rollNumber !== undefined) updates.rollNumber = rollNumber;
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const { cloudinary } = require('../config/cloudinary');

    // Delete old avatar from cloudinary
    if (req.user.avatar && req.user.avatar.public_id) {
      await cloudinary.uploader.destroy(req.user.avatar.public_id);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: req.file.path,
          public_id: req.file.filename,
        },
      },
      { new: true }
    );

    res.json({ success: true, message: 'Avatar updated successfully.', avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null }, { validateBeforeSave: false });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: rToken } = req.body;
    if (!rToken) return res.status(401).json({ success: false, message: 'Refresh token required.' });

    const decoded = require('jsonwebtoken').verify(rToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== rToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newToken = user.generateAuthToken();
    res.json({ success: true, token: newToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

module.exports = {
  register, verifyEmail, resendOTP, login, forgotPassword,
  verifyResetOTP, resetPassword, getMe, updateProfile,
  changePassword, uploadAvatar, logout, refreshToken,
};
