import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/instructor.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {checkRole} from "../middlewares/role.middlewares.js"

const router = Router();

router.get("/dashboard/stats", verifyJWT, checkRole('instructor'),getChannelStats);
router.get("/dashboard/videos/:userId", verifyJWT,checkRole('instructor'), getChannelVideos);

export default router;
