import { Schema, model } from "mongoose";
import { ILike } from "../interfaces/ILike.js";

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referenceModel: { type: String, required: true, enum: ["Post", "Recipe"] },
    referenceId: { type: Schema.Types.ObjectId, required: true, refPath: "referenceModel" },
  },
  { timestamps: true },
);

// A user can only like a specific reference once
LikeSchema.index({ user: 1, referenceId: 1, referenceModel: 1 }, { unique: true });

export const Like = model<ILike>("Like", LikeSchema);
