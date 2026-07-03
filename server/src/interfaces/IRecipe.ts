import mongoose, { Document } from "mongoose";

export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  preparationTime: number; // in minutes
  estimatedPrice: string; // e.g., '$', '$$', '$$$'
  type: string; // e.g., 'Starter', 'Main Course', 'Dessert'
  diet: string[]; // e.g., 'Vegetarian', 'Vegan', 'Gluten-Free'
  difficulty: string; // e.g., 'Easy', 'Medium', 'Hard'
  photos: string[];
  author: mongoose.Types.ObjectId;
  isPublic: boolean;
  averageRating: number;
}
