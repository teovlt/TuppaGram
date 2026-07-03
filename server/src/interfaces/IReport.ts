import mongoose, { Document } from "mongoose";

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  referenceModel: "Post" | "Recipe" | "Comment";
  referenceId: mongoose.Types.ObjectId;
  reason: string;
}
