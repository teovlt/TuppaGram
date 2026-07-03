import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken(), getNotifications);
router.put("/:id/read", verifyToken(), markAsRead);
router.put("/read-all", verifyToken(), markAllAsRead);

export default router;
