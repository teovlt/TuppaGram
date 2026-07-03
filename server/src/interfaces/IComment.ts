import mongoose, { Document } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  author: mongoose.Types.ObjectId;
  referenceModel: "Post" | "Recipe";
  referenceId: mongoose.Types.ObjectId;
}
