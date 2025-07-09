import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/instructor.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/dashboard/stats", verifyJWT, getChannelStats);
router.get("/dashboard/videos/:userId", verifyJWT, getChannelVideos);

export default router;
