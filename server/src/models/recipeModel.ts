import { Schema, model } from "mongoose";
import { IRecipe } from "../interfaces/IRecipe.js";

const RecipeStepSchema = new Schema(
  {
    text: { type: String, required: true },
    duration: { type: Number },
  },
  { _id: false },
);

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ingredients: [{ type: String, required: true }],
    steps: [RecipeStepSchema],
    preparationTime: { type: Number, required: true },
    cookingTime: { type: Number, default: 0 },
    servings: { type: Number, default: 2 },
    estimatedPrice: { type: String, required: true },
    type: { type: String, required: true },
    cuisine: { type: String, default: "" },
    diet: [{ type: String }],
    difficulty: { type: String, required: true },
    photos: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    tips: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Recipe = model<IRecipe>("Recipe", RecipeSchema);
