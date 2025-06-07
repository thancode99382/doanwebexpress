const multer = require("multer");
const path = require("path");
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs');

// Local storage configuration (fallback if Cloudinary fails)
const localStoragePath = path.join(process.cwd(), 'uploads', 'images');

// Ensure uploads directory exists
if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localStoragePath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Try to use Cloudinary storage, but have local storage as fallback
let storage;

try {
  // Configure Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'sevenlove_blogs',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1000, height: 500, crop: 'limit' }]
    }
  });
  console.log('Using Cloudinary for image storage');
} catch (error) {
  console.error('Error setting up Cloudinary storage:', error.message);
  console.log('Falling back to local storage for images');
  storage = localStorage;
}

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File must be an image (jpg, jpeg, png, gif, webp)"), false);
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Create a middleware wrapper that handles errors
const uploadMiddleware = {
  single: (fieldName) => {
    return (req, res, next) => {
      const uploader = upload.single(fieldName);
      
      uploader(req, res, (err) => {
        if (err) {
          console.error('File upload error:', err.message);
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).render('home/error', {
                layout: 'layouts/mainLayout',
                title: 'Upload Error',
                error: 'File is too large. Maximum size is 5MB.'
              });
            }
          }
          return res.status(400).render('home/error', {
            layout: 'layouts/mainLayout',
            title: 'Upload Error',
            error: err.message || 'An error occurred during file upload'
          });
        }
        next();
      });
    };
  }
};

module.exports = uploadMiddleware;
