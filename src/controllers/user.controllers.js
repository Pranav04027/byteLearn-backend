import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { QuizAttempt } from "../models/quizAttempt.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinaryDelete } from "../utils/cloudinaryDelete.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(501, "Error while finding the user");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //Save to the database
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      502,
      "Something went wrong while generating the access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password, role } = req.body;
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);


  if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (role && !["learner", "instructor"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'learner' or 'instructor'");
  }

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Get uploaded file paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  // Validate avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Upload avatar to Cloudinary
  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new Error("Cloudinary upload failed for avatar");
    }
    console.log("Uploaded avatar:", avatar.url);
  } catch (error) {
    console.error("Error uploading avatar:", error.message);
    throw new ApiError(500, "Failed to upload avatar", error.message);
  }

  // Upload cover image to Cloudinary (optional)
  let coverImage;
  try {
    if (coverLocalPath) {
      coverImage = await uploadOnCloudinary(coverLocalPath);
      if (!coverImage?.url) {
        throw new Error("Cloudinary upload failed for cover image");
      }
      console.log("Uploaded coverImage:", coverImage.url);
    }
  } catch (error) {
    console.error("Error uploading coverImage:", error.message);
    if (avatar?.public_id) {
      await cloudinaryDelete(avatar.public_id);
    }
    throw new ApiError(500, "Failed to upload cover image", error.message);
  }

  // Create user
  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url || "",
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
      role: role || "learner", // Default to learner if not provided
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));

  } catch (error) {
    console.error("Error creating user:", error.message);
    if (avatar?.public_id) {
      await cloudinaryDelete(avatar.public_id);
    }
    if (coverImage?.public_id) {
      await cloudinaryDelete(coverImage.public_id);
    }
    throw new ApiError(500, "Failed to create user", error.message);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from body
  const { email, username, password } = req.body;

  //validation
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({//Mongoose
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  //Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is invalid");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(user?._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(
      501,
      "An error occured while fetching the loggedin user"
    );
  }
  // Cookie setup, common standard practice
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //In development, secure: false , allows testing
  };

  // Tokens are cookies too
  return res
    .status(200)
    .cookie("accessToken", accessToken, options) //res.cookie(name, value, [options]) STANDARD.
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User loggedin successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  //First remove the RefreshTokens from DB
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //In development, secure: false , allows testing
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Each time access tokens are expired, both gets generated.
const refreshAccessToken = asyncHandler(async (req, res) => {
  //grabbing the refreshTokens that have expired
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id); //MongoDB

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refreshtoken is expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", //In development, secure: false , allows testing
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessandRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options) //When a new token in a cookie with the same cookie name is set, it automatically replaces the old one on the client’s browser
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while refreshing refreshTokens"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false }); // Mongoose

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Updated Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current User details"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  if (!username && !email) {
    throw new ApiError(401, "All fields required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, user, "Updated user successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Something went wrong while fetching the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Something went wrong while uploading Cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage Updated successfully"));
});

//Fetch the subscriber list
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req.params; //params comes in as object

  if (!username) {
    throw new ApiError(400, "Could not get username from URL params");
  }

  const channel = await User.aggregate(
    //Returns array of docs
    [
      {
        $match: {
          username: username.toLowerCase(), //MongoDB query
        },
      },
      {
        // Getting MY subscribers.
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel", //Find all documents where channel == MY ID
          as: "listOfSubscribers",
        },
      },
      {
        //Getting the channels i have subscribed to
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "listOfChannelsSubscribedto",
        },
      },
      {
        $addFields: {
          numberOfSubscribers: {
            $size: { $ifNull: [ "$listOfSubscribers", []] },
          },
          numberOfChannelsSubscribedto: {
            $size: { $ifNull: ["$listOfChannelsSubscribedto", []] },
          },
           // here
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          fullname: 1,
          avatar: 1,
          coverImage: 1,
          listOfSubscribers: 1,
          listOfChannelsSubscribedto: 1,
          numberOfSubscribers: 1,
          numberOfChannelsSubscribedto: 1,
          isSubscribed: 1,
        },
      },
    ]
  );


  if (channel?.length === 0) {
    throw new ApiError(400, "Channel not found");
  }


  return res
    .status(200)
    .json(
      new ApiResponse(200, channel, "Channel profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "listOfWatchedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            //overwriting the owner field because we will get array in response. we are flattening.
            $addFields: {
              owner: {
                $arrayElemAt: ["$Owner", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        numberOfVideosWatched: {
          $size: { $ifNull: ["$listOfWatchedVideos", []] },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullname: 1,
        avatar: 1,
        coverImage: 1,
        listOfWatchedVideos: 1,
        numberOfVideosWatched: 1,
      },
    },
  ]);

  if (!watchHistory?.length) {
    throw new ApiError(400, "Watch history not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        watchHistory[0],
        "Watch History retrived successfully"
      )
    );
});

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
    quizAttempts // 👈 added here
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Fetched learner dashboard"));
});


export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
