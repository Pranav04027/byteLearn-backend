import {Router} from "express";
import { registerUser,
         logoutUser,
         loginUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getUserChannelProfile,
         getWatchHistory,
         getLearnerDashboard
        } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"


const router = Router()

router.route("/register").post(
    upload.fields([ //multer.fields() RETURNS a middleware function with next() built-in
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser) //raw JSON body, "username", "password", "email"

router.route("/refresh-token").post(refreshAccessToken) //No input required but should be logged in

//secured routes

router.route("/logout").post(verifyJWT , logoutUser) //No input required but should be logged in

router.route("/change-password").patch(verifyJWT, changeCurrentPassword) //give JSON raw body oldPassword , newPassword

router.route("/current-user").get(verifyJWT, getCurrentUser) // Nothing, Just Should be logged in

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails) // username , email

router.get("/dashboard", verifyJWT, getLearnerDashboard); // You know the difference between this and the other version.

router.route("/update-avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)

router.route("/update-coverimage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router