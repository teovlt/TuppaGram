import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addReport, getReports } from "../controllers/reportController.js";

const router = express.Router();

router.post("/", verifyToken(), addReport);
// Ideally this one should be protected by an isAdmin middleware
router.get("/", verifyToken(), getReports);

export default router;
