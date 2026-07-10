import mongoose, { Document } from "mongoose";

export interface IRecipeStep {
  text: string;
  duration?: number; // optional duration in minutes for this step
}

export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  ingredients: string[];
  steps: IRecipeStep[];
  preparationTime: number; // in minutes
  cookingTime: number; // in minutes
  servings: number; // number of portions
  estimatedPrice: string; // e.g., '$', '$$', '$$$'
  type: string; // e.g., 'Starter', 'Main Course', 'Dessert'
  cuisine: string; // e.g., 'French', 'Italian', 'Japanese'
  diet: string[]; // e.g., 'Vegetarian', 'Vegan', 'Gluten-Free'
  difficulty: string; // e.g., 'Easy', 'Medium', 'Hard'
  photos: string[];
  author: mongoose.Types.ObjectId;
  isPublic: boolean;
  averageRating: number;
  tips: string; // Chef tips / notes
}
