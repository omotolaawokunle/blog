const express = require("express");
const {
  createBlog,
  getPublishedBlogs,
  getBlogById,
  getMyBlogs,
  updateBlog,
  updateBlogState,
  deleteBlog,
} = require("../controllers/blogController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getPublishedBlogs);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", protect, createBlog);
router.get("/me/posts", protect, getMyBlogs);
router.put("/:id", protect, updateBlog);
router.patch("/:id/state", protect, updateBlogState);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
