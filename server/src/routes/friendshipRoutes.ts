import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getMyFriends,
  getUserFriends,
  getPendingRequests,
  getSentRequests,
  getFriendshipStatus,
} from "../controllers/friendshipController.js";

const router = express.Router();

// All routes require authentication
router.post("/request/:userId", verifyToken(), sendFriendRequest);
router.put("/accept/:friendshipId", verifyToken(), acceptFriendRequest);
router.put("/decline/:friendshipId", verifyToken(), declineFriendRequest);
router.delete("/:friendshipId", verifyToken(), removeFriend);

router.get("/friends", verifyToken(), getMyFriends);
router.get("/friends/:userId", verifyToken(), getUserFriends);
router.get("/pending", verifyToken(), getPendingRequests);
router.get("/sent", verifyToken(), getSentRequests);
router.get("/status/:userId", verifyToken(), getFriendshipStatus);

export default router;
