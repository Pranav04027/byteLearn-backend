import {User} from "../models/user.models.js"
import { QuizAttempt } from "../models/quizAttempt.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getLearnerDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("progress.video", "title thumbnail duration category difficulty")
    .populate("watchHistory", "title thumbnail duration category difficulty")
    .populate("bookmarks", "title thumbnail duration category difficulty");

  const resumeVideos = user.progress
    .filter((entry) => entry.progress < 90)
    .map((entry) => ({
      video: entry.video,
      progress: entry.progress,
    }));

  // Fetch quiz attempts for learner
  const quizAttempts = await QuizAttempt.find({ user: req.user._id })
    .populate("video", "title thumbnail")
    .sort({ createdAt: -1 });

  const response = {
    resumeVideos,
    bookmarks: user.bookmarks,
    watchHistory: user.watchHistory,
    quizAttempts
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Fetched learner dashboard"));
});