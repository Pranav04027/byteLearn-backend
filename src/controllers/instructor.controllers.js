import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Post } from "../models/post.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {

  //Total view Count across all videos.
  let totalViews;
  try {
    totalViews = await Video.aggregate([
      {
        $match: {
          owner: req.user?._id, // filter only videos of this user
        },
      },
      {
        $group: {
          _id: "$owner", // group by owner
          totalViews: { $sum: "$views" },
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(500, "Failed to fetch total views");
  }

  //Total Subscribbers Count . {I am Channel}
  let totalSubscribers;
  try {
    totalSubscribers = await Subscription.aggregate([
      {
        $match: { channel: req.user?._id },
      },
      {
        $group: {
          _id: null,
          totalSubscribers: { $sum: 1 },
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(500, "Failed to fetch total subscribers");
  }

  //All Video Count Uploaded
  let totalVideos;
  try {
    totalVideos = await Video.countDocuments({ owner: req.user?._id });
  } catch (error) {
    throw new ApiError(500, "Failed to fetch total videos");
  }

  //Total Likes Across Videos
  let totalLikes;
  try {
    totalLikes = await Like.aggregate([
      {
        $match: { owner: req.user?._id } // filter only likes of this user
      },
      {
        $group: {
          _id: null, 
          totalLikes: { $sum: 1 }
        }
      }, // group and sum likes
    ]);
  } catch (error) {
    throw new ApiError(500, "Failed to fetch total likes");
  }

  //Total number of posts created by the channel
  let totalPosts;
  try {
    totalPosts = await Post.aggregate([
      {
        $match: { owner: req.user?._id } 
      },
      {
        $count: "totalPosts" 
      }
    ]);
  } catch (error) {
    throw new ApiError(500, "Failed to fetch total posts");
  }

  res.status(200).json(
    new ApiResponse(200, {
      totalViews: totalViews[0]?.totalViews || 0,
      totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
      totalVideos: totalVideos || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      totalPosts: totalPosts || 0,
    }, "Fetched channel stats successfully")
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Please provide a valid user ID");
  }

  let channelVideos;
  try {
    channelVideos = await Video.aggregate([
      {
        $match: { owner: new mongoose.Types.ObjectId(userId) }, // filter videos by owner
      },
      {
        $lookup: {
          from: "users", // collection to join with
          localField: "owner", // field from the Video collection
          foreignField: "_id", // field from the User collection
          as: "ownerDetails", // output array field
        },
      },
      {
        $unwind: "$ownerDetails", // unwind the ownerDetails array
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          thumbnail: 1,
          videofile: 1,
          isPublished: 1,
          ownerDetails: {
            _id: "$ownerDetails._id",
            name: "$ownerDetails.name",
            profilePicture: "$ownerDetails.profilePicture",
          },
        },
      },  
      {
        $sort: { createdAt: -1 }, // sort by creation date, most recent first
      },
    ]);
  } catch (error) {
    throw new ApiError(500, "Failed to fetch channel videos"); 
  }

  if (!channelVideos || channelVideos.length === 0) {
  return res
    .status(200)
    .json(new ApiResponse(200, [], "No videos found for this channel"));
}


  res.status(200).json(
    new ApiResponse(200, channelVideos, "Fetched channel videos successfully")
  );

});

const getLikesByVideo = asyncHandler(async (req, res) => {
  const { videoIds } = req.body;
  if (!Array.isArray(videoIds) || videoIds.length === 0) {
    throw new ApiError(400, "videoIds array is required");
  }
  const ids = videoIds.map(id => new mongoose.Types.ObjectId(id));
  const rows = await Like.aggregate([
    { $match: { video: { $in: ids } } },
    { $group: { _id: "$video", likeCount: { $sum: 1 } } }
  ]);
  // Normalize to a map for easy client merge
  const map = rows.reduce((acc, r) => { acc[r._id.toString()] = r.likeCount; return acc; }, {});
  return res.status(200).json(new ApiResponse(200, map, "Likes per video"));
});

// Parse duration string like "MM:SS" or "HH:MM:SS" to seconds
const parseDurationToSeconds = (dur) => {
  if (!dur || typeof dur !== 'string') return 0;
  const parts = dur.split(":").map(n => Number(n));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    const [hh, mm, ss] = parts; return (hh * 3600) + (mm * 60) + ss;
  }
  if (parts.length === 2) {
    const [mm, ss] = parts; return (mm * 60) + ss;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
};

// Estimate watch-time and average view duration for the instructor's channel
const getWatchTimeStats = asyncHandler(async (req, res) => {
  // Fetch this instructor's videos
  const vids = await Video.find({ owner: req.user?._id }, { _id: 1, duration: 1 });
  if (!vids.length) {
    return res.status(200).json(new ApiResponse(200, { totalWatchTimeHours: 0, avgViewDurationSeconds: 0 }, "No videos for this channel"));
  }
  const vidIds = vids.map(v => v._id);
  const durMap = new Map(vids.map(v => [v._id.toString(), parseDurationToSeconds(v.duration)]));

  // Find users who have progress for these videos (project only needed fields)
  const users = await User.find({ "progress.video": { $in: vidIds } }, { progress: 1 }).lean();

  let totalSeconds = 0;
  let countEntries = 0;
  for (const u of users) {
    const arr = Array.isArray(u.progress) ? u.progress : [];
    for (const p of arr) {
      const vid = p?.video?.toString?.();
      if (!vid) continue;
      const durSec = durMap.get(vid) || 0;
      if (!durSec) continue;
      const perc = Math.min(100, Math.max(0, Number(p.progress) || 0));
      const watched = (perc / 100) * durSec;
      if (watched > 0) {
        totalSeconds += watched;
        countEntries += 1;
      }
    }
  }

  const totalWatchTimeHours = Number((totalSeconds / 3600).toFixed(2));
  const avgViewDurationSeconds = countEntries ? Math.round(totalSeconds / countEntries) : 0;

  return res.status(200).json(new ApiResponse(200, { totalWatchTimeHours, avgViewDurationSeconds }, "Watch-time stats"));
});

export { getChannelStats, getChannelVideos, getLikesByVideo, getWatchTimeStats };
