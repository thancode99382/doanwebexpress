const multer = require("multer");
const path = require("path");
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sevenlove_blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 500, crop: 'limit' }]
  }
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File không phải là ảnh!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
