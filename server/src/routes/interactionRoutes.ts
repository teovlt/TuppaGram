import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  addComment,
  getComments,
  toggleLike,
  getLikesCount,
  toggleBookmark,
  getBookmarks,
  addRating
} from "../controllers/interactionController.js";

const router = express.Router();

// Comments
router.post("/comments", verifyToken(), addComment);
router.get("/comments/:referenceModel/:referenceId", getComments); // public

// Likes
router.post("/likes", verifyToken(), toggleLike);
router.get("/likes/:referenceModel/:referenceId/count", getLikesCount); // public

// Bookmarks
router.post("/bookmarks", verifyToken(), toggleBookmark);
router.get("/bookmarks", verifyToken(), getBookmarks); // get my bookmarks

// Ratings
router.post("/ratings", verifyToken(), addRating);

export default router;
