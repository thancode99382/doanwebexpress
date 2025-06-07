const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Check if Cloudinary credentials are available
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('CLOUDINARY CONFIGURATION ERROR: Missing required environment variables');
  console.error('Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your .env file');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test connection and log result
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('CLOUDINARY CONNECTION ERROR:', error.message);
  } else {
    console.log('CLOUDINARY CONNECTION: Successfully connected to Cloudinary API');
  }
});

module.exports = cloudinary;