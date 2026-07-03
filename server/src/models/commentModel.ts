import { Schema, model } from "mongoose";
import { IComment } from "../interfaces/IComment.js";

const CommentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referenceModel: { type: String, required: true, enum: ["Post", "Recipe"] },
    referenceId: { type: Schema.Types.ObjectId, required: true, refPath: "referenceModel" },
  },
  { timestamps: true },
);

export const Comment = model<IComment>("Comment", CommentSchema);
