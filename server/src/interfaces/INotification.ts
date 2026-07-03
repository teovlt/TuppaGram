import mongoose, { Document } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: string; // e.g., 'like', 'comment', 'follow'
  link: string;
  read: boolean;
}
