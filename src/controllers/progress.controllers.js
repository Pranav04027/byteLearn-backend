import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const updateProgress = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { percent } = req.body;

    // Validate request data
    if (!videoId || percent === undefined) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Video ID and percent are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    // If no field named progress, create one
    if (!user.progress) user.progress = [];

    const existing = user.progress.find(
      (item) => item.video.toString() === videoId
    );

    if (existing) {
      existing.progress = percent;
    } else {
      user.progress.push({ video: videoId, progress: percent });
    }

    // If 95%+ watched, add to watch history
    if (percent >= 95 && !user.watchHistory.includes(videoId)) {
      user.watchHistory.push(videoId);
    }

    await user.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Progress updated",
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || "An error occurred while updating progress",
    });
  }
});



const getProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id)
    .populate("progress.video", "title thumbnail duration category difficulty")
    .select("progress");

  return res.status(200).json(new ApiResponse(200, user.progress));
});

const getContinueWatching = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id)
    .populate("progress.video", "title thumbnail duration category difficulty");

  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, null, "User not found")
    );
  }

  const inProgressVideos = 
  user.progress.filter((entry) => entry.progress > 0 && entry.progress < 95)
    .map(entry => ({
      videoId: entry.video._id,
      title: entry.video.title,
      thumbnail: entry.video.thumbnail,
      duration: entry.video.duration,
      progress: entry.progress,
      category: entry.video.category,
      difficulty: entry.video.difficulty
    }));

  return res.status(200).json(
    new ApiResponse(200, inProgressVideos, "In-progress videos")
  );
});

export { 
  updateProgress,
  getProgress,
  getContinueWatching
};
