 import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getRecommendedVideos = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user?._id)
    .select("progress bookmarks")
    .populate("progress.video", "tags category difficulty")
    .populate("bookmarks", "tags category difficulty");

  if (!user) throw new ApiError(404, "User not found");

  const watchedThreshold = 90;

  const interactedVideos = [
    ...user.progress
    .filter(entry => entry.video && entry.progress >= watchedThreshold)
    .map(entry => entry.video),
    ...user.bookmarks.filter(Boolean),
  ];


  const tags = new Set();
  const categories = new Set();
  const difficulties = new Set();

  for (const video of interactedVideos) {
    video.tags?.forEach((tag) => tags.add(tag));
    if (video.category) categories.add(video.category);
    if (video.difficulty) difficulties.add(video.difficulty);
  }

  const recommendedVideos = await Video.find({
    tags: { $in: Array.from(tags) },
    category: { $in: Array.from(categories) },
    difficulty: { $in: Array.from(difficulties) },
    _id: { $nin: interactedVideos.map((v) => v._id) },
    isPublished: true,
  }).limit(15);

  return res
    .status(200)
    .json(new ApiResponse(200, recommendedVideos, "Recommended videos"));
});
