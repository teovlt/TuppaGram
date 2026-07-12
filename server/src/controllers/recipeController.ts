import { Request, Response } from "express";
import { Recipe } from "../models/recipeModel.js";
import { User } from "../models/userModel.js";
import { Notification } from "../models/notificationModel.js";
import { getAcceptedFriendIds } from "./friendshipController.js";
import { userRoles } from "../utils/enums/userRoles.js";

// Create a new recipe
export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      ingredients,
      steps,
      preparationTime,
      cookingTime,
      servings,
      estimatedPrice,
      type,
      cuisine,
      diet,
      difficulty,
      photos,
      isPublic,
      tips,
    } = req.body;
    const authorId = req.userId;

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      preparationTime,
      cookingTime: cookingTime || 0,
      servings: servings || 2,
      estimatedPrice,
      type,
      cuisine: cuisine || "",
      diet,
      difficulty,
      photos,
      author: authorId,
      isPublic,
      tips: tips || "",
    });

    await newRecipe.save();

    if (isPublic) {
      const friendIds = await getAcceptedFriendIds(authorId.toString());
      if (friendIds.length > 0) {
        const notifications = friendIds.map((friendId) => ({
          recipient: friendId,
          type: "new_recipe",
          link: `/recipes/${newRecipe._id}`,
        }));
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ message: "Recette créée avec succès", recipe: newRecipe });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all public recipes (with search & filters)
export const getPublicRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type, diet, difficulty, cuisine, maxTime } = req.query;

    const query: any = { isPublic: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { ingredients: { $regex: search, $options: "i" } },
        { cuisine: { $regex: search, $options: "i" } },
      ];
    }
    if (type) query.type = type;
    if (diet) query.diet = { $in: Array.isArray(diet) ? diet : [diet] };
    if (difficulty) query.difficulty = difficulty;
    if (cuisine) query.cuisine = cuisine;
    if (maxTime) {
      const max = Number(maxTime);
      query.$expr = { $lte: [{ $add: ["$preparationTime", "$cookingTime"] }, max] };
    }

    const recipes = await Recipe.find(query)
      .populate("author", "username avatar fullname")
      .sort({ createdAt: -1 });

    res.status(200).json({ recipes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get recipe by ID
export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("author", "username avatar fullname bio");
    if (!recipe) {
      res.status(404).json({ error: "Recette non trouvée" });
      return;
    }
    res.status(200).json({ recipe });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update recipe
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      res.status(404).json({ error: "Recette non trouvée" });
      return;
    }

    if (!recipe.author.equals(req.userId)) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Recette mise à jour", recipe: updatedRecipe });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete recipe
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      res.status(404).json({ error: "Recette non trouvée" });
      return;
    }

    const user = await User.findById(req.userId);
    const isAdmin = user?.role === userRoles.ADMIN;

    if (!recipe.author.equals(req.userId) && !isAdmin) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Recette supprimée" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get recipes by author
export const getUserRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    // If requesting own profile, can see private recipes, otherwise only public
    const isOwnProfile = req.userId && req.userId.toString() === userId;
    const query: any = { author: userId };
    if (!isOwnProfile) {
      query.isPublic = true;
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    res.status(200).json({ recipes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all recipes
export const getAllRecipesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const skip = page * size;

    const user = await User.findById(req.userId);
    if (user?.role !== userRoles.ADMIN) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    const recipes = await Recipe.find()
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);
    const count = await Recipe.countDocuments();

    res.status(200).json({ recipes, count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
