import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  toggleCommentLike,
  togglePostLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controllers.js";

const router = Router();

//Protected routes
router.route("/likevideo/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/likecomment/:commentId").post(verifyJWT, toggleCommentLike);

router.route("/likepost/:postId").post(verifyJWT, togglePostLike);

router.route("/likedvideos").get(verifyJWT, getLikedVideos);

export default router;