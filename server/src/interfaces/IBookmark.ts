import mongoose, { Document } from "mongoose";

export interface IBookmark extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
}
