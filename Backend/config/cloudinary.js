const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  return (
    cloudName && apiKey && apiSecret
    && !cloudName.includes('your_')
    && !apiKey.includes('your_')
    && !apiSecret.includes('your_')
  );
};

const cloudinaryEnabled = isCloudinaryConfigured();

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️  Cloudinary is not configured. Image uploads are disabled in this environment.');
}

// Item images storage
const itemStorage = cloudinaryEnabled
  ? new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'campus_lost_found/items',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    },
  })
  : multer.memoryStorage();

// Avatar storage
const avatarStorage = cloudinaryEnabled
  ? new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'campus_lost_found/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
    },
  })
  : multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadItemImages = multer({
  storage: itemStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB per file, max 5 files
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

// Chat images storage
const chatStorage = cloudinaryEnabled
  ? new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'campus_lost_found/chat',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  })
  : multer.memoryStorage();

const uploadChatImage = multer({
  storage: chatStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

module.exports = { cloudinary, uploadItemImages, uploadAvatar, uploadChatImage, cloudinaryEnabled };
