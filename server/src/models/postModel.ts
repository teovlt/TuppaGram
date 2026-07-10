import { Schema, model } from "mongoose";
import { IPost } from "../interfaces/IPost.js";

const PostSchema = new Schema<IPost>(
  {
    text: { type: String, trim: true },
    photos: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipeRef: { type: Schema.Types.ObjectId, ref: "Recipe" },
    tags: [{ type: String, trim: true, lowercase: true }],
    location: { type: String, default: "", trim: true },
    visibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
  },
  { timestamps: true },
);

export const Post = model<IPost>("Post", PostSchema);
