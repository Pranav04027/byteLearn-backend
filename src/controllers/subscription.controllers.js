import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "could not retrive channelId from params");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Please provide a valid channelId");
  }

  //Check if Subscription Already exists
  const subscription = await Subscription.findOne({
    $and: [
      {
        subscriber: req.user?._id,
        channel: channelId,
      },
    ],
  });

  let newsubscription;

  if (subscription) {
    try {
      await subscription.deleteOne();
    } catch (error) {
      throw new ApiError(400, "Some problem occurred while unsubscribing");
    }
  } else {
    // Not subscribed → subscribe
    try {
      newsubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });
    } catch (error) {
      throw new ApiError(
        400,
        `Error while subscribing to channel, newsubs: ${newsubscription}`
      );
    }
  }

  return res.status(200).json(new ApiResponse(200, `Done`));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "could not retrive channelId from params");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Please provide a valid channelId");
  }

  let subscribers;

  //Get subscribers list through pipeline
  try {
    subscribers = await Subscription.aggregate([
      {
        $match: { channel: new mongoose.Types.ObjectId(channelId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "Subscriber_List",
          pipeline: [
            {
              $project: {
                username: 1,
                fullname: 1,
                email: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(
      500,
      "There was an error while fetching subscriber list"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Successfully retrived Subscribers List"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "could not retrive subscriberId from params");
  }

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Please provide a valid subscriberId");
  }

  let subscribedChannels;

  //Get channels through pipelines

  try {
    subscribedChannels = await Subscription.aggregate([
      {
        $match: {subscriber: new mongoose.Types.ObjectId(subscriberId)}
      },
      {
        $lookup:{
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "Subscribed Channel List:",
          pipeline: [
            {
              $project:{
                username: 1,
                fullname: 1,
                email: 1,
                avatar: 1,
              }
            }
          ]
        }
      }
    ])
  } catch (error) {
    throw new ApiError(
      500,
      "There was an error while fetching channel list"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Successfully retrived channel List"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
