import { Request, Response } from "express";
import { Report } from "../models/reportModel.js";

export const addReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceModel, referenceId, reason } = req.body;
    const reporterId = req.userId;

    const newReport = new Report({
      reporter: reporterId,
      referenceModel,
      referenceId,
      reason,
    });

    await newReport.save();
    res.status(201).json({ message: "Signalement enregistré" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Admin route
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // We assume an admin middleware would check roles, but for now we just return them
    const reports = await Report.find().populate("reporter", "username email").sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
