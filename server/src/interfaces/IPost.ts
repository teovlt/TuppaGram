import mongoose, { Document } from "mongoose";

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  photos: string[];
  author: mongoose.Types.ObjectId;
  recipeRef?: mongoose.Types.ObjectId;
}
