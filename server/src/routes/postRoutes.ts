import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createPost,
  getFeed,
  getPostById,
  deletePost,
  getUserPosts,
  updatePost,
} from "../controllers/postController.js";

const router = express.Router();

// Protected feed & post creation
router.get("/feed", verifyToken(), getFeed);
router.post("/", verifyToken(), createPost);
router.put("/:id", verifyToken(), updatePost);
router.delete("/:id", verifyToken(), deletePost);

// Public-facing profile posts and specific post view
router.get("/user/:userId", verifyToken(), getUserPosts);
router.get("/:id", getPostById);

export default router;
