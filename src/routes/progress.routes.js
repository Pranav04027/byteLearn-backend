import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { updateProgress, getProgress , getContinueWatching} from "../controllers/progress.controllers.js";

const router = Router();

router.post("/update/:videoId", verifyJWT, updateProgress);
router.get("/get", verifyJWT, getProgress);
router.get("/continue", verifyJWT, getContinueWatching);

export default router;
