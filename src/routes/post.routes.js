import { Router } from "express";
import {
  createPost,
  getUserPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
//Public routes
router.route("/userposts/:userId").get(getUserPosts);

//Protected routes

router.route("/createpost").post(verifyJWT, createPost)

router.route("/updatepost/:postId").patch(verifyJWT, updatePost);

router.route("/deletepost/:postId").delete(verifyJWT, deletePost);

export default router;