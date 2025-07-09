import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "express";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "could not retrive videoId from params");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid videoId");
  }

  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const filter = {video: videoId};

  let comments;
  try {
    comments = await Comment.find(filter)
      .limit(Number(limit))
      .skip(Number(skip));
  } catch (error) {
    throw new ApiError(500, "Some error occured while Retriving all Comments");
  }

  let totalCommentCount;
  try {
    totalCommentCount = await Comment.countDocuments(filter);
  } catch (error) {
    throw new ApiError(
      500,
      "Some error occured while counting Number of Comments in the video"
    );
  }

  return res.status(200).json(new ApiResponse(200, {
    totalComments: totalCommentCount,
    page: page,
    limit: limit,
    all_comments: comments 
  }, "Successfully retrived all the Comments for the Video"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "could not retrive videoId from params");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid videoId");
  }

  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  //Find if exact same comment exists to avoid spam
  const spamcomment = await Comment.findOne({
    content: content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  let newcomment;
  if (spamcomment) {
    throw new ApiError(
      400,
      `SPAM NOT ALLOWED. Exact same comment exists: ${spamcomment}`
    );
    return;
  } else {
    try {
      newcomment = await Comment.create({
        content: content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id),
      });
    } catch (error) {
      throw new ApiError(400, "Could not create comment");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newcomment, "Commented successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "could not retrive commentId from params");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Please provide a valid commentId");
  }

  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  //Varify owner
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user?._id)) {
    throw new ApiError(
      403,
      "Unauthorized. You can only update your own comment."
    );
  }

  let updatedComment;
  try {
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(400, "Some error occured while updating in DB");
  }

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or update failed");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment Updated succcessfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "could not retrive commentId from params");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Please provide a valid commentId");
  }

  //Varify owner
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user?._id)) {
    throw new ApiError(
      403,
      "Unauthorized. You can only delete your own comment."
    );
  }

  //Delete
  try {
    await comment.deleteOne();
  } catch (error) {
    throw new ApiResponse(400, "Some error occured while deleting from DB");
  }

  res.status(200).json(new ApiResponse(200, "Deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
