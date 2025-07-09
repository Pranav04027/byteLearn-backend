// learner.routes.js
import { Router } from "express";
import { getLearnerDashboard } from "../controllers/learner.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/dashboard", verifyJWT, getLearnerDashboard);

export default router;
