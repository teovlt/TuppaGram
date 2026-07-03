import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createRecipe,
  getPublicRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
} from "../controllers/recipeController.js";

const router = express.Router();

// Public routes
router.get("/", getPublicRecipes);
router.get("/:id", getRecipeById);
router.get("/user/:userId", getUserRecipes); // Depending on implementation, we could protect this, but usually profiles are public

// Protected routes
router.post("/", verifyToken(), createRecipe);
router.put("/:id", verifyToken(), updateRecipe);
router.delete("/:id", verifyToken(), deleteRecipe);

export default router;
