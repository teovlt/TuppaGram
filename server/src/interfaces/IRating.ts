import mongoose, { Document } from "mongoose";

export interface IRating extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
  value: number; // 1 to 5
}
