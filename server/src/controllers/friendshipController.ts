import { Request, Response } from "express";
import { Friendship } from "../models/friendshipModel.js";
import { User } from "../models/userModel.js";
import { Notification } from "../models/notificationModel.js";

/**
 * Send a friend request to another user.
 * POST /api/friendships/request/:userId
 */
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    if (currentUserId.toString() === userId) {
      res.status(400).json({ error: "Vous ne pouvez pas vous ajouter vous-même" });
      return;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    // Check if a friendship already exists in either direction
    const existing = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        res.status(400).json({ error: "Vous êtes déjà amis" });
        return;
      }
      if (existing.status === "pending") {
        // If the other user already sent us a request, auto-accept
        if (existing.requester.toString() === userId) {
          existing.status = "accepted";
          await existing.save();

          await new Notification({
            recipient: userId,
            type: "friend_accepted",
            link: `/user/${currentUserId}`,
          }).save();

          res.status(200).json({ message: "Demande d'ami acceptée", friendship: existing });
          return;
        }
        res.status(400).json({ error: "Demande déjà envoyée" });
        return;
      }
      if (existing.status === "declined") {
        // Allow re-requesting if previously declined
        existing.status = "pending";
        existing.requester = currentUserId as any;
        existing.recipient = userId as any;
        await existing.save();

        await new Notification({
          recipient: userId,
          type: "friend_request",
          link: `/user/${currentUserId}`,
        }).save();

        res.status(200).json({ message: "Demande d'ami envoyée", friendship: existing });
        return;
      }
    }

    const friendship = new Friendship({
      requester: currentUserId,
      recipient: userId,
      status: "pending",
    });

    await friendship.save();

    await new Notification({
      recipient: userId,
      type: "friend_request",
      link: `/user/${currentUserId}`,
    }).save();

    res.status(201).json({ message: "Demande d'ami envoyée", friendship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accept a friend request.
 * PUT /api/friendships/accept/:friendshipId
 */
export const acceptFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { friendshipId } = req.params;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      res.status(404).json({ error: "Demande non trouvée" });
      return;
    }

    // Only the recipient can accept
    if (friendship.recipient.toString() !== currentUserId.toString()) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    if (friendship.status !== "pending") {
      res.status(400).json({ error: "Cette demande n'est plus en attente" });
      return;
    }

    friendship.status = "accepted";
    await friendship.save();

    await new Notification({
      recipient: friendship.requester,
      type: "friend_accepted",
      link: `/user/${currentUserId}`,
    }).save();

    res.status(200).json({ message: "Demande d'ami acceptée", friendship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Decline a friend request.
 * PUT /api/friendships/decline/:friendshipId
 */
export const declineFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { friendshipId } = req.params;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      res.status(404).json({ error: "Demande non trouvée" });
      return;
    }

    // Only the recipient can decline
    if (friendship.recipient.toString() !== currentUserId.toString()) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    friendship.status = "declined";
    await friendship.save();

    res.status(200).json({ message: "Demande d'ami refusée", friendship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove a friend (or cancel a pending request).
 * DELETE /api/friendships/:friendshipId
 */
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { friendshipId } = req.params;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      res.status(404).json({ error: "Amitié non trouvée" });
      return;
    }

    // Either party can remove
    const isInvolved =
      friendship.requester.toString() === currentUserId.toString() ||
      friendship.recipient.toString() === currentUserId.toString();

    if (!isInvolved) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    await Friendship.findByIdAndDelete(friendshipId);
    res.status(200).json({ message: "Ami supprimé" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get my accepted friends list.
 * GET /api/friendships/friends
 */
export const getMyFriends = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;

    const friendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: "accepted",
    })
      .populate("requester", "username avatar fullname bio")
      .populate("recipient", "username avatar fullname bio");

    // Map to return the "other" user for each friendship
    const friends = friendships.map((f) => {
      const friend = f.requester._id.toString() === currentUserId.toString() ? f.recipient : f.requester;
      return { friendshipId: f._id, user: friend };
    });

    res.status(200).json({ friends });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a user's accepted friends list (public).
 * GET /api/friendships/friends/:userId
 */
export const getUserFriends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    })
      .populate("requester", "username avatar fullname bio")
      .populate("recipient", "username avatar fullname bio");

    const friends = friendships.map((f) => {
      const friend = f.requester._id.toString() === userId ? f.recipient : f.requester;
      return { friendshipId: f._id, user: friend };
    });

    res.status(200).json({ friends });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending friend requests received by the current user.
 * GET /api/friendships/pending
 */
export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;

    const requests = await Friendship.find({
      recipient: currentUserId,
      status: "pending",
    })
      .populate("requester", "username avatar fullname bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get friend requests sent by the current user.
 * GET /api/friendships/sent
 */
export const getSentRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;

    const requests = await Friendship.find({
      requester: currentUserId,
      status: "pending",
    })
      .populate("recipient", "username avatar fullname bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check friendship status with a specific user.
 * GET /api/friendships/status/:userId
 */
export const getFriendshipStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const friendship = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (!friendship) {
      res.status(200).json({ status: "none", friendship: null });
      return;
    }

    const direction =
      friendship.requester.toString() === currentUserId.toString() ? "outgoing" : "incoming";

    res.status(200).json({
      status: friendship.status,
      direction,
      friendship,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper: Get all accepted friend IDs for a user.
 */
export const getAcceptedFriendIds = async (userId: string): Promise<string[]> => {
  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: "accepted",
  });

  return friendships.map((f) =>
    f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString(),
  );
};
