import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { uploadConfig, uploadImageConfig } from "../configuration/storageConfig.js";
import { updateUserAvatar, uploadGenericImage } from "../controllers/uploadController.js";

export const uploadRouter: Router = express.Router();

/**
 * @route POST /avatar/:id
 * @description Updates the avatar of a user by their ID.
 */
uploadRouter.post("/avatar/:id", verifyToken(), uploadConfig.single("avatar"), updateUserAvatar);

/**
 * @route POST /image
 * @description Uploads a generic image (for posts/recipes).
 */
uploadRouter.post("/image", verifyToken(), uploadImageConfig.single("image"), uploadGenericImage);
