import { Schema, model } from "mongoose";
import { IFriendship } from "../interfaces/IFriendship.js";

const FriendshipSchema = new Schema<IFriendship>(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true },
);

// Ensure uniqueness: a pair of users can only have one friendship record
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship = model<IFriendship>("Friendship", FriendshipSchema);
