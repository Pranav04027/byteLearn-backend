import { Router } from "express";
import {
  getChannelStats, getChannelVideos
} from "../controllers/dashboard.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//protected routes
router.route("/channel-stats").get(verifyJWT, getChannelStats);

router.route("/channel-videos/:userId").get(verifyJWT, getChannelVideos);

export default router;
