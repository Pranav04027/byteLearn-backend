import { Router } from "express";
import {getLikesByVideo, getChannelStats, getChannelVideos, getWatchTimeStats } from "../controllers/instructor.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {checkRole} from "../middlewares/role.middlewares.js"

const router = Router();

router.get("/dashboard/stats", verifyJWT, checkRole('instructor'),getChannelStats);

router.get("/dashboard/videos/:userId", verifyJWT,checkRole('instructor'), getChannelVideos);

router.post("/dashboard/likes-by-video", verifyJWT, checkRole('instructor'), getLikesByVideo);

router.get("/dashboard/watch-stats", verifyJWT, checkRole('instructor'), getWatchTimeStats);

export default router;
