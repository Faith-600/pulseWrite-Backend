const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/auth/userProfile");
const upload = require("../config/cloudinaryConfig");
const { protect } = require("../middleware/authMiddleware");

// @route   PUT /api/users/profile
// @desc    Update the logged-in user's profile
// @access  Private
router.put("/profile", protect, upload.single("profilePicture"), updateProfile);

module.exports = router;
