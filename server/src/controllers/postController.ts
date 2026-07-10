import { Request, Response } from "express";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import { getAcceptedFriendIds } from "./friendshipController.js";

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, photos, recipeRef, tags, location, visibility } = req.body;
    const authorId = req.userId;

    const newPost = new Post({
      text,
      photos: photos || [],
      author: authorId,
      recipeRef: recipeRef || undefined,
      tags: tags || [],
      location: location || "",
      visibility: visibility || "public",
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

// Feed: Get posts from friends + own posts (using friendship model)
export const getFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Get all accepted friend IDs
    const friendIds = await getAcceptedFriendIds(userId.toString());

    // Build feed query:
    // - Own posts (all visibilities)
    // - Friends' posts with visibility 'public' or 'friends'
    // - Non-friends' posts with visibility 'public' (not included — feed is friends only)
    const feedQuery = {
      $or: [
        { author: userId }, // all own posts
        {
          author: { $in: friendIds },
          visibility: { $in: ["public", "friends"] },
        },
      ],
    };

    const posts = await Post.find(feedQuery)
      .populate("author", "username avatar fullname")
      .populate("recipeRef", "title photos averageRating")
      .sort({ createdAt: -1 })
      .limit(50);

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

    const { text, photos, recipeRef, tags, location, visibility } = req.body;
    
    post.text = text;
    post.photos = photos || [];
    post.recipeRef = recipeRef && recipeRef !== "none" ? recipeRef : undefined;
    post.tags = tags || [];
    post.location = location || "";
    post.visibility = visibility || "public";

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
    const currentUserId = req.userId;

    // Check if viewer is the author or a friend
    const isOwnProfile = currentUserId && currentUserId.toString() === userId;

    let visibilityFilter: any = { visibility: "public" };

    if (isOwnProfile) {
      visibilityFilter = {}; // see all own posts
    } else if (currentUserId) {
      const friendIds = await getAcceptedFriendIds(currentUserId.toString());
      if (friendIds.includes(userId)) {
        visibilityFilter = { visibility: { $in: ["public", "friends"] } };
      }
    }

    const posts = await Post.find({ author: userId, ...visibilityFilter })
      .populate("author", "username avatar fullname")
      .populate("recipeRef", "title photos")
      .sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
