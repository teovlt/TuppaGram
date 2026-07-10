import mongoose, { Document } from "mongoose";

export interface IFriendship extends Document {
  _id: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined";
}
