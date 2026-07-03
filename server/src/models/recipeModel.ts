import { Schema, model } from "mongoose";
import { IRecipe } from "../interfaces/IRecipe.js";

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ingredients: [{ type: String, required: true }],
    steps: [{ type: String, required: true }],
    preparationTime: { type: Number, required: true },
    estimatedPrice: { type: String, required: true },
    type: { type: String, required: true },
    diet: [{ type: String }],
    difficulty: { type: String, required: true },
    photos: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Recipe = model<IRecipe>("Recipe", RecipeSchema);
