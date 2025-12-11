const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/auth/postController");
const { protect } = require("../middleware/authMiddleware");

const createPostValidation = [
  check("title", "Title is required").not().isEmpty(),
  check("content", "Content is required").not().isEmpty(),
];

router.post("/", protect, createPostValidation, createPost);

router.put("/:id", protect, createPostValidation, updatePost);

router.get("/", getAllPosts);

router.get("/:id", getPostById);

router.delete("/:id", protect, deletePost);

module.exports = router;
