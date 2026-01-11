const express = require("express");
const router = express.Router();
const {
  updateProfile,
  updateInterests,
  getMyProfile,
} = require("../controllers/auth/userProfile");
const upload = require("../config/cloudinaryConfig");
const { protect } = require("../middleware/authMiddleware");
const { check } = require("express-validator");

router.put("/profile", protect, upload.single("profilePicture"), updateProfile);
const interestsValidation = [
  check("interests", "Interests must be an array").isArray(),
  check("interests.*", "Each interest must be a string").isString(),
];

router.put("/interests", protect, interestsValidation, updateInterests);
router.get("/me", protect, getMyProfile);

module.exports = router;
