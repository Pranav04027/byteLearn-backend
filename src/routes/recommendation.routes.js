import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getRecommendedVideos } from "../controllers/recommendation.controllers.js";

const router = Router();

router.get("/recommended", verifyJWT, getRecommendedVideos);

export default router;
