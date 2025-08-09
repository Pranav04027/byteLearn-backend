import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.models.js";
import mongoose, {isValidObjectId} from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "All fiels are required");
  }

  const {videos} = req.body;

  if (!videos || !Array.isArray(videos)) {
      throw new ApiError(400, "videos array is required");
    }

  const playlist = await Playlist.create({
    name,
    description,
    videos,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(501, "A problem occured while creating the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Successfully created the playlist"));
});

// Get my playlists
const getMyPlaylists = asyncHandler(async (req, res) => {

  //const playlist = await Playlist.find({ owner: req.user?._id });

  const playlist = await Playlist.aggregate([
    {
      $match:{
        owner: new mongoose.Types.ObjectId( req.user?._id )
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"videos",
        foreignField:"_id",
        as: "videos",
        pipeline:[
          {
            $project:{
              title: 1,
              description: 1,
              thumbnail: 1,
              category: 1,
              difficulty: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              createdAt: 1
            }
          }
        ]
      }
    },
    {
      $project:{
        name: 1,
        description: 1,
        videos: 1,
        createdAt: 1
      }
    }
  ])
  
  if (!playlist) {
    throw new ApiError(500, "An error occured while finding the Playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Retrived playlist sucessfully"));
});

//Get playlist of any user by UserId in parameters
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Could not get userId from params");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Enter a valid MongoDB ObjectId");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "videos", // collection name in MongoDB
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              category: 1,
              difficulty: 1,
              duration: 1,
              tags: 1,
              views: 1,
              isPublished: 1,
              createdAt: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        createdAt: 1
      }
    }
  ]);

  if (!playlists) {
    throw new ApiError(500, "Could not get the playlists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlists, "Retrieved playlists successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Could not get data from URL params");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "One of the ObjectIds is not valid");
  }

  // Check ownership
  const checkPlaylist = await Playlist.findById(playlistId);
  if (!checkPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (checkPlaylist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "There was an authorization error.");
  }

  // Add video without duplicates
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }, // Prevents duplicates
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while adding the video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Added successfully"));
});


export { createPlaylist, getMyPlaylists , getUserPlaylists , addVideoToPlaylist};
