import { Schema, model } from "mongoose";
import { INotification } from "../interfaces/INotification.js";

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    link: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = model<INotification>("Notification", NotificationSchema);
