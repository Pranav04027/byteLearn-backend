import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//Unprotected Routes
router.route("/getvideocomments/:videoId").get(getVideoComments)

//Protected routes
router.route("/comment/:videoId").post(verifyJWT , addComment)

router.route("/updatecomment/:commentId").post(verifyJWT , updateComment)

router.route("/deletecomment/:commentId").post(verifyJWT , deleteComment)

export default router;
