import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid video ID");
  }

  // Check if the like already exists
  const existingLike = await Like.findOne({
    $and: [{ likedBy: req.user?._id }, { video: videoId }],
  });

  // If it exists, delete it (unlike)
  if (existingLike) {
    try {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, "Video unliked successfully"));
    } catch (error) {
      throw new ApiError(400, "Some problem occurred while unliking the video");
    }
  } else {
    // If it doesn't exist, create a new like
    try {
      const newLike = await Like.create({
        likedBy: req.user._id,
        video: videoId,
      });
      return res
        .status(201)
        .json(new ApiResponse(201, "Video liked successfully", newLike));
    } catch (error) {
      throw new ApiError(400, `Error while liking the video: ${error.message}`);
    }
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Please provide a valid comment ID");
  }
  // Check if the like already exists
  const existingLike = await Like.findOne({
    $and: [{ likedBy: req.user?._id }, { comment: commentId }],
  });

  // If it exists, delete it (unlike)
  if (existingLike) {
    try {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, "Comment unliked successfully"));
    } catch (error) {
      throw new ApiError(
        400,
        "Some problem occurred while unliking the comment"
      );
    }
  } else {
    // If it doesn't exist, create a new like
    try {
      const newLike = await Like.create({
        likedBy: req.user._id,
        comment: commentId,
      });
      return res
        .status(201)
        .json(new ApiResponse(201, "Comment liked successfully", newLike));
    } catch (error) {
      throw new ApiError(
        400,
        `Error while liking the comment: ${error.message}`
      );
    }
  }
});

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post ID is required");
  }
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Please provide a valid post ID");
  }

  // Check if the like already exists
  const existingLike = await Like.findOne({
    $and: [{ likedBy: req.user?._id }, { post: postId }],
  });

  // If it exists, delete it (unlike)
  if (existingLike) {
    try {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, "Post unliked successfully"));
    } catch (error) {
      throw new ApiError(400, "Some problem occurred while unliking the post");
    }
  } else {
    // If it doesn't exist, create a new like
    try {
      const newLike = await Like.create({
        likedBy: req.user._id,
        post: postId,
      });
      return res
        .status(201)
        .json(new ApiResponse(201, "Post liked successfully", newLike));
    } catch (error) {
      throw new ApiError(400, `Error while liking the post: ${error.message}`);
    }
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $project: {
        _id: 1,
        videoDetails: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, likedVideos ,"Liked videos fetched successfully")
  );
});

export { toggleCommentLike, togglePostLike, toggleVideoLike, getLikedVideos };
