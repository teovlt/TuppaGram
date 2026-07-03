import { Request, Response } from "express";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, photos, recipeRef } = req.body;
    const authorId = req.userId;

    const newPost = new Post({
      text,
      photos,
      author: authorId,
      recipeRef: recipeRef || undefined,
    });

    await newPost.save();
    
    // Populate the newly created post immediately for the frontend
    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "username avatar fullname")
      .populate("recipeRef", "title photos averageRating");

    res.status(201).json({ message: "Post publié avec succès", post: populatedPost });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Feed: Get posts from following users + own posts
export const getFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    const following = user.following || [];
    const authors = [...following, userId];

    const posts = await Post.find({ author: { $in: authors } })
      .populate("author", "username avatar fullname")
      .populate("recipeRef", "title photos averageRating")
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50 for now

    res.status(200).json({ posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar fullname bio")
      .populate("recipeRef", "title description photos");
      
    if (!post) {
      res.status(404).json({ error: "Post non trouvé" });
      return;
    }
    res.status(200).json({ post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post non trouvé" });
      return;
    }

    if (!post.author.equals(req.userId)) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post supprimé" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post non trouvé" });
      return;
    }

    if (!post.author.equals(req.userId)) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const { text, photos, recipeRef } = req.body;
    
    post.text = text;
    post.photos = photos || [];
    post.recipeRef = recipeRef && recipeRef !== "none" ? recipeRef : undefined;

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatar fullname")
      .populate("recipeRef", "title photos averageRating");

    res.status(200).json({ message: "Post mis à jour", post: populatedPost });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId })
      .populate("author", "username avatar fullname")
      .populate("recipeRef", "title photos")
      .sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
