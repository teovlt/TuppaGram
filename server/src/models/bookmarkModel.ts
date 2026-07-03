import { Schema, model } from "mongoose";
import { IBookmark } from "../interfaces/IBookmark.js";

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
  },
  { timestamps: true },
);

// A user can only bookmark a specific recipe once
BookmarkSchema.index({ user: 1, recipe: 1 }, { unique: true });

export const Bookmark = model<IBookmark>("Bookmark", BookmarkSchema);
