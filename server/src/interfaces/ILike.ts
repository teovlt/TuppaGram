import mongoose, { Document } from "mongoose";

export interface ILike extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  referenceModel: "Post" | "Recipe";
  referenceId: mongoose.Types.ObjectId;
}
