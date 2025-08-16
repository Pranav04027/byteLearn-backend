import mongoose, { isValidObjectId } from "mongoose";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  let post;

  try {
    post = await Post.create({
      content: content,
      owner: new mongoose.Types.ObjectId(req.user?._id),
    });
  } catch (error) {
    throw new ApiError(400, "Some error occured while creating post");
  }

  res.status(200).json(new ApiResponse(200, post,"Created post successfully"));

});

const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "could not retrieve userId from params");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Please provide a valid userId");
  }

  let userposts;

  try {
    userposts = await Post.find({ owner: userId }).sort({ createdAt: -1 }).populate("owner", "username avatar fullname");;
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "Some error occurred while fetching posts");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userposts,
        "Fetched user posts successfully"
      )
    );
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!postId) {
    throw new ApiError(400, "post ID is required");
  }

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Please provide a valid post ID");
  }

  if (!content) {
    throw new ApiError(400, "Content is required to update the post");
  }

  let updatedpost;
  try {
    updatedpost = await Post.findByIdAndUpdate(
      postId,
      { content: content },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(400, "Some error occurred while updating the post");
  }

  if (!updatedpost) {
    throw new ApiError(404, "Post not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedpost, "Updated post successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(400, "Post ID is required");
  }

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Please provide a valid post ID");
  }

  let deletedpost;
  try {
    deletedpost = await Post.findByIdAndDelete(postId);
  } catch (error) {
    throw new ApiError(400, "Some error occurred while deleting the post");
  }

  if (!deletedpost) {
    throw new ApiError(404, "Post not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Deleted post successfully"));
});

export { createPost, getUserPosts, updatePost, deletePost };
