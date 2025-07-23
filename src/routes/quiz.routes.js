import { Router } from "express";
import {
  createQuiz,
   getQuizByVideo,
  submitQuiz,
} from "../controllers/quiz.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {quizSchemaValidator} from "../validators/quiz.validator.js"
import { validate } from "../middlewares/validator.middlewares.js"

const router = Router();

router.post("/create/:videoId", verifyJWT,validate({body: quizSchemaValidator}) ,createQuiz); // Only for instructors
router.get("/:videoId", verifyJWT, getQuizByVideo);
router.post("/:videoId/submit", verifyJWT, submitQuiz);

export default router;
