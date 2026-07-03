import multer from "multer";
import { Request } from "express";
import path from "path";
import mongoose from "mongoose";

interface MulterRequest extends Request {
  userId: mongoose.Types.ObjectId;
}

// Configuration for Multer to handle file uploads
const storageConfig = multer.diskStorage({
  destination: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "./uploads/users/avatars");
  },

  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const extension = path.extname(file.originalname);
    const userIdPart = req.userId;
    cb(null, `avatar_${userIdPart}_${Date.now()}${extension}`);
  },
});

// Middleware Multer to handle avatar uploads
export const uploadConfig = multer({
  storage: storageConfig,
});

// Generic Image Upload
const imageStorageConfig = multer.diskStorage({
  destination: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "./uploads/images");
  },

  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const extension = path.extname(file.originalname);
    const userIdPart = req.userId;
    cb(null, `img_${userIdPart}_${Date.now()}${extension}`);
  },
});

export const uploadImageConfig = multer({
  storage: imageStorageConfig,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
