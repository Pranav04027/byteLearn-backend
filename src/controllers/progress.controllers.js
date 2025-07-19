import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const updateProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { progress } = req.body;

  if (!videoId || progress === undefined) {
    throw new ApiError(400, "Video ID and progress are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.progress) user.progress = [];

  const existing = user.progress.find((entry) =>
    entry.video.toString() === videoId
  );

  if (existing) {
    existing.progress = progress;
  } else {
    user.progress.push({ video: videoId, progress });
  }

  if (progress >= 95 && !user.watchHistory.includes(videoId)) {
    user.watchHistory.push(videoId);
  }

  await user.save();

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Progress updated",
  });
});


const getProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("progress.video", "title thumbnail duration category difficulty")
    .select("progress");

  return res.status(200).json(new ApiResponse(200, user.progress));
});

const getContinueWatching = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("progress.video", "title thumbnail duration category difficulty");

  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, null, "User not found")
    );
  }

  const inProgressVideos = user.progress
    .filter(entry => entry.progress > 0 && entry.progress < 95)
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
