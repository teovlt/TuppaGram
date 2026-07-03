import { Schema, model } from "mongoose";
import { IReport } from "../interfaces/IReport.js";

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referenceModel: { type: String, required: true, enum: ["Post", "Recipe", "Comment"] },
    referenceId: { type: Schema.Types.ObjectId, required: true, refPath: "referenceModel" },
    reason: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Report = model<IReport>("Report", ReportSchema);
