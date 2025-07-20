import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
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

export { getChannelStats, getChannelVideos };
