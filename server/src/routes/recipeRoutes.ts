import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createRecipe,
  getPublicRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
  getAllRecipesAdmin,
} from "../controllers/recipeController.js";

const router = express.Router();

// Admin routes
router.get("/admin/all", verifyToken(), getAllRecipesAdmin);

// Public routes
router.get("/", getPublicRecipes);
router.get("/:id", getRecipeById);
router.get("/user/:userId", verifyToken(), getUserRecipes);

// Protected routes
router.post("/", verifyToken(), createRecipe);
router.put("/:id", verifyToken(), updateRecipe);
router.delete("/:id", verifyToken(), deleteRecipe);

export default router;
