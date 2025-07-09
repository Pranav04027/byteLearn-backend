import { Bookmark } from "../models/bookmark.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addBookmark = async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const already = await Bookmark.findOne({ user: userId, video: videoId });
  if (already) {
    throw new ApiError(400, "Video already bookmarked");
  }

  const bookmark = await Bookmark.create({ user: userId, video: videoId });
  return res.status(201).json(new ApiResponse(201, bookmark, "Bookmarked"));
};

export const removeBookmark = async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const removed = await Bookmark.findOneAndDelete({ user: userId, video: videoId });
  if (!removed) {
    throw new ApiError(404, "Bookmark not found");
  }

  return res.status(200).json(new ApiResponse(200, removed, "Removed bookmark"));
};

export const getMyBookmarks = async (req, res) => {
  const userId = req.user._id;

  const bookmarks = await Bookmark.find({ user: userId }).populate("video");
  return res.status(200).json(new ApiResponse(200, bookmarks));
};
