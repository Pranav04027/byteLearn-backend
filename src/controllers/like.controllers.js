import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "Video ID is required");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Please provide a valid video ID");

  const deleted = await Like.findOneAndDelete({
    likedBy: req.user._id,
    video: videoId,
  });

  if (deleted) {
    return res.status(200).json(new ApiResponse(200, "Video unliked successfully"));
  }

  try {
    const newLike = await Like.create({
      likedBy: req.user._id,
      video: videoId,
    });
    return res.status(201).json(new ApiResponse(201, "Video liked successfully", newLike));
  } catch (error) {
    if (error.code === 11000) throw new ApiError(400, "You already liked this video");
    throw new ApiError(400, `Error while liking the video: ${error.message}`);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) throw new ApiError(400, "Comment ID is required");
  if (!isValidObjectId(commentId)) throw new ApiError(400, "Please provide a valid comment ID");

  const deleted = await Like.findOneAndDelete({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (deleted) {
    return res.status(200).json(new ApiResponse(200, "Comment unliked successfully"));
  }

  try {
    const newLike = await Like.create({
      likedBy: req.user._id,
      comment: commentId,
    });
    return res.status(201).json(new ApiResponse(201, "Comment liked successfully", newLike));
  } catch (error) {
    if (error.code === 11000) throw new ApiError(400, "You already liked this comment");
    throw new ApiError(400, `Error while liking the comment: ${error.message}`);
  }
});

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) throw new ApiError(400, "Post ID is required");
  if (!isValidObjectId(postId)) throw new ApiError(400, "Please provide a valid post ID");

  const deleted = await Like.findOneAndDelete({
    likedBy: req.user._id,
    post: postId,
  });

  if (deleted) {
    return res.status(200).json(new ApiResponse(200, "Post unliked successfully"));
  }

  try {
    const newLike = await Like.create({
      likedBy: req.user._id,
      post: postId,
    });
    return res.status(201).json(new ApiResponse(201, "Post liked successfully", newLike));
  } catch (error) {
    if (error.code === 11000) throw new ApiError(400, "You already liked this post");
    throw new ApiError(400, `Error while liking the post: ${error.message}`);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(req.user._id), video: { $exists: true } }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $project: {
        _id: 1,
        videoDetails: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, togglePostLike, toggleVideoLike, getLikedVideos };
