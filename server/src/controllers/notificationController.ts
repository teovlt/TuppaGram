import { Request, Response } from "express";
import { Notification } from "../models/notificationModel.js";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ notifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { read: true });
    res.status(200).json({ message: "Notification lue" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    res.status(200).json({ message: "Toutes les notifications lues" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
