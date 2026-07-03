import { Schema, model } from "mongoose";
import { IRating } from "../interfaces/IRating.js";

const RatingSchema = new Schema<IRating>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

// A user can only rate a specific recipe once
RatingSchema.index({ user: 1, recipe: 1 }, { unique: true });

export const Rating = model<IRating>("Rating", RatingSchema);
