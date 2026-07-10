import { Request, Response } from "express";
import { Comment } from "../models/commentModel.js";
import { Like } from "../models/likeModel.js";
import { Bookmark } from "../models/bookmarkModel.js";
import { Rating } from "../models/ratingModel.js";
import { Notification } from "../models/notificationModel.js";
import { Post } from "../models/postModel.js";
import { Recipe } from "../models/recipeModel.js";
import jwt from "jsonwebtoken";

// Helper to notify author
const notifyAuthor = async (recipientId: string, type: string, link: string) => {
  if (recipientId) {
    await new Notification({ recipient: recipientId, type, link }).save();
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, referenceModel, referenceId } = req.body;
    const authorId = req.userId;

    const newComment = new Comment({
      text,
      author: authorId,
      referenceModel,
      referenceId,
    });

    await newComment.save();
    
    // Notify author
    if (referenceModel === "Post") {
      const post = await Post.findById(referenceId);
      if (post && !post.author.equals(authorId)) {
        await notifyAuthor(post.author.toString(), "comment", `/post/${referenceId}`);
      }
    } else if (referenceModel === "Recipe") {
      const recipe = await Recipe.findById(referenceId);
      if (recipe && !recipe.author.equals(authorId)) {
        await notifyAuthor(recipe.author.toString(), "comment", `/recipe/${referenceId}`);
      }
    }

    const populatedComment = await Comment.findById(newComment._id).populate("author", "username avatar");
    res.status(201).json({ message: "Commentaire ajouté", comment: populatedComment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceModel, referenceId } = req.params;
    const comments = await Comment.find({ referenceModel, referenceId })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 });
    res.status(200).json({ comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceModel, referenceId } = req.body;
    const userId = req.userId;

    const existingLike = await Like.findOne({ user: userId, referenceModel, referenceId });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      res.status(200).json({ message: "Like retiré", liked: false });
    } else {
      await new Like({ user: userId, referenceModel, referenceId }).save();
      res.status(201).json({ message: "Like ajouté", liked: true });

      // Notify author
      if (referenceModel === "Post") {
        const post = await Post.findById(referenceId);
        if (post && !post.author.equals(userId)) {
          await notifyAuthor(post.author.toString(), "like", `/post/${referenceId}`);
        }
      } else if (referenceModel === "Recipe") {
        const recipe = await Recipe.findById(referenceId);
        if (recipe && !recipe.author.equals(userId)) {
          await notifyAuthor(recipe.author.toString(), "like", `/recipe/${referenceId}`);
        }
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLikesCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceModel, referenceId } = req.params;
    const count = await Like.countDocuments({ referenceModel, referenceId });

    let isLiked = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN as string) as any;
        if (decoded && decoded.id) {
          const userLike = await Like.findOne({ referenceModel, referenceId, user: decoded.id });
          if (userLike) isLiked = true;
        }
      } catch (e) {
        // Ignore token verification errors for this public route
      }
    }

    res.status(200).json({ count, isLiked });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipeId } = req.body;
    const userId = req.userId;

    const existingBookmark = await Bookmark.findOne({ user: userId, recipe: recipeId });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      res.status(200).json({ message: "Favori retiré", bookmarked: false });
    } else {
      await new Bookmark({ user: userId, recipe: recipeId }).save();
      res.status(201).json({ message: "Favori ajouté", bookmarked: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const bookmarks = await Bookmark.find({ user: userId }).populate("recipe", "title photos averageRating preparationTime cookingTime");
    res.status(200).json({ bookmarks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipeId, value } = req.body;
    const userId = req.userId;

    let rating = await Rating.findOne({ user: userId, recipe: recipeId });

    if (rating) {
      rating.value = value;
      await rating.save();
    } else {
      rating = new Rating({ user: userId, recipe: recipeId, value });
      await rating.save();
    }

    // Re-calculate average rating
    const ratings = await Rating.find({ recipe: recipeId });
    const avg = ratings.reduce((acc, curr) => acc + curr.value, 0) / ratings.length;
    await Recipe.findByIdAndUpdate(recipeId, { averageRating: avg });

    res.status(200).json({ message: "Note enregistrée", rating: rating.value, averageRating: avg });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
