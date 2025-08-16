import {
  uploadOnCloudinary,
  uploadVideoOnCloudinary,
  cloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { VideoView } from "../models/videoView.models.js";
import { isValidObjectId } from "mongoose";
import { cloudinaryDelete } from "../utils/cloudinaryDelete.js";
import { getPublicIdFromUrl } from "../utils/getCloudinaryPublicid.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, difficulty, category } = req.body;

  if ([title, description, difficulty, category].some((item)=> item.trim()==="")) {
    throw new ApiError(400, "All fields are required including title, description, difficulty and category");
  }

  //Check if it exists already
  const videoExists = await Video.findOne({$and:[{title:title, description}]});
  if (videoExists) {
    throw new ApiError(400, "The video already Exists");
  }

  //Get file path and validate
  const localvidpath = req.files?.video?.[0]?.path;
  const localthumbnailpath = req.files?.thumbnail?.[0]?.path;

  if (!localthumbnailpath || !localvidpath) {
    throw new ApiError(404, "Could not get the paths for files.");
  }

  //upload to cloudinary
  let videofile;
  try {
    videofile = await uploadVideoOnCloudinary(localvidpath);
    console.log("uploaded video on cloudinary", videofile);
  } catch (error) {
    throw new ApiError(
      509,
      "Error occured while uploading video to cloudinary"
    );
  }

  let thumbnailfile;
  try {
    thumbnailfile = await uploadOnCloudinary(localthumbnailpath);
    console.log("uploaded thumbnail on cloudinary", thumbnailfile);
  } catch (error) {
    throw new ApiError(
      509,
      "Error occured while uploading thumbnail to cloudinary"
    );
  }

  //create video in DB
  let video;

  try {
    video = await Video.create({
      videofile: videofile.url || "",
      thumbnail: thumbnailfile.url || "",
      title,
      description,
      duration: videofile.duration || "0",
      owner: req.user?._id,
      difficulty,
      category,
    });
  } catch (error) {
    await cloudinary.uploader.destroy(videofile?.public_id);
    await cloudinary.uploader.destroy(thumbnailfile?.public_id);
    throw new ApiError(400, "Could not create the video in DB", error);
  }

  //check if created properly also get video from DB
  let createdVideo;
  try {
    createdVideo = await Video.findOne({ $and: [{ title, description }] });
  } catch (error) {
    await cloudinary.uploader.destroy(videofile?.public_id);
    await cloudinary.uploader.destroy(thumbnailfile?.public_id);
    throw new ApiError(400, "The video was not created properly");
  }

  //response
  return res
    .status(201)
    .json(new ApiResponse(209, createdVideo, "Video Created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params; //string
  if (!videoId) {
    throw new ApiError(400, "could not retrive videoId from params");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid videoId");
  }

  const video = await Video.findById(videoId)
    .populate("owner", "username avatar channelname"); 
    // 2nd arg = fields to select from User model

  if (!video) {
    throw new ApiError(400, "Could not retrive video from DB");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Retrived video successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "could not retrive videoId from params");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid videoId");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Could not retrive video from DB");
  }

  //Validate if the user requesting delete is the owner

  if (!video.owner.equals(req.user._id)) {
    // Important
    throw new ApiError(
      403,
      "UnAuthorised. Login as owner of this video to delete"
    );
  }

  const vidpublicId = getPublicIdFromUrl(video?.videofile);
  const thumbnailpublicId = getPublicIdFromUrl(video?.thumbnail);

  // Delete from cloudinary
  try {
    await cloudinaryDelete(vidpublicId, { resource_type: "video" });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while deleting video from cloudinary"
    );
  }

  try {
    await cloudinaryDelete(thumbnailpublicId, { resource_type: "image" });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while deleting thumbnail from cloudinary"
    );
  }

  // Delete from DB
  try {
    await Video.findByIdAndDelete(videoId);
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while deleting video from DB"
    );
  }

  return res.status(200).json(new ApiResponse(200, "Deleted."));
});

const updateVideo = asyncHandler(async (req, res) => {
  // Get video id from params and validate it
  const { videoId } = req.params; //string
  if (!videoId) {
    throw new ApiError(400, "could not retrive videoId from params");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid videoId");
  }

  //get data from body, thumbnail and verify it
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const localthumbnailpath = req.file?.path;
  if (!localthumbnailpath) {
    throw new ApiError(404, "Could not get the paths for files.");
  }

  // Get the Video
  const video = await Video.findById(videoId);

  //Validate User
  if (!video.owner.equals(req.user._id)) {
    // Important
    throw new ApiError(
      403,
      "UnAuthorised. Login as owner of this video to Update"
    );
  }

  // Delete old from cloudinary.
  const thumbnailpublicId = getPublicIdFromUrl(video?.thumbnail);
  try {
    await cloudinaryDelete(thumbnailpublicId, { resource_type: "image" });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while deleting thumbnail from cloudinary"
    );
  }

  //Upload new Thumbnail to cloudinary
  let thumbnailfile;
  try {
    thumbnailfile = await uploadOnCloudinary(localthumbnailpath);
    console.log("uploaded thumbnail on cloudinary", thumbnailfile);
  } catch (error) {
    throw new ApiError(
      509,
      "Error occured while uploading thumbnail to cloudinary"
    );
  }

  //Update DB
  var updateVideo;
  try {
    updateVideo = await Video.findByIdAndUpdate( videoId,
      {
        $set: {
          thumbnail: thumbnailfile?.url,
          title: title,
          description: description,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, "Some error occured while updating the DB");
  }

  //Get it back from DB after update to verify

  const updatedVideo = await Video.findById(videoId);
  if (!updatedVideo) {
    throw new ApiError(400, "Not updated correctly");
  }

  //response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Updated successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params; //string
  if (!videoId) {
    throw new ApiError(400, "could not retrive videoId from params");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Please provide a valid videoId");
  }

  // Get the Video
  const video = await Video.findById(videoId);

  //Validate User
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(
      403,
      "UnAuthorised. Login as owner of this video to Update"
    );
  }

  //Update toggle status
  var updateVideo;
  try {
    updateVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: !video.isPublished,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, "Some error occured while Toggling isPublished");
  }

  //Get it back from DB after update to verify

  const updatedVideo = await Video.findById(videoId);
  if (!updatedVideo) {
    throw new ApiError(400, "Not updated correctly");
  }

  //response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "isPublished toggled successfully")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
    category,
    difficulty,
    tags,
  } = req.query;

  const skip = (page - 1) * limit;

  let filter = {
    isPublished: true, // only show public content
  };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    filter.owner = userId;
  }

  if (category) {
    filter.category = category;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : tags.split(",");
    filter.tags = { $in: tagsArray };
  }

  const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };

  let videos;
  try {
    videos = await Video.find(filter)
      .sort(sortOptions)
      .skip(Number(skip))
      .limit(Number(limit));
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while retrieving videos from DB"
    );
  }

  let total;
  try {
    total = await Video.countDocuments(filter);
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while getting video count from DB"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        results: videos,
      },
      "Fetched videos"
    )
  );
});

const addVideoView = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || null;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    null;

  // Find video and check ownership
  const vid = await Video.findById(id).select("owner views");
  if (!vid) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Skip counting if owner is watching their own video
  if (userId && String(vid.owner) === String(userId)) {
    return res.json({ counted: false, views: vid.views ?? 0 });
  }

  // Try to record a unique view
  try {
    await VideoView.create({
      video: id,
      user: userId || undefined,
      ip: userId ? undefined : ip
    });
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
  } catch (err) {
    // Likely a duplicate unique view (ignore)
  }

  // Get updated views
  const updated = await Video.findById(id).select("views");
  return res.json({ counted: true, views: updated?.views ?? vid.views ?? 0 });
};

export {
  publishVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
  getAllVideos,
  addVideoView
};
