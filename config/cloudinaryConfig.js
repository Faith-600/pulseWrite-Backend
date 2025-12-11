const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
// This tells Multer to upload files to a specific folder in your Cloudinary account
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pulsewrite_profiles", // The name of the folder in Cloudinary
    allowed_formats: ["jpg", "png", "gif", "svg"], // Allowed image formats
  },
});

// Create the Multer upload instance
const upload = multer({ storage: storage });

module.exports = upload;
