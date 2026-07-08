import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { updateUserAvatar, uploadImage } from "../controllers/uploadController.js";
import { uploadConfig } from "../configuration/storageConfig.js";

export const uploadRouter: Router = express.Router();

/**
 * Middleware to set the target Firebase folder in req.body.
 */
const setFolder = (folder: string) => (req: any, res: any, next: any) => {
  req.body = req.body || {};
  req.body.folder = folder;
  next();
};

/**
 * @route POST /avatar/:id
 * @description Updates the avatar of a user by their ID.
 * @param {string} id - The ID of the user whose avatar is being updated.
 * @middleware verifyToken() - Ensures the user is authenticated to access this route.
 * @middleware uploadConfig.single("avatar") - Handles the file upload for the "avatar" field.
 */
uploadRouter.post("/avatar/:id", verifyToken(), uploadConfig.single("avatar"), updateUserAvatar);

uploadRouter.post("/image", verifyToken(), uploadConfig.single("image"), uploadImage);
