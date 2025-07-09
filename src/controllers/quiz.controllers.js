import { Quiz } from "../models/quiz.models.js";
import { QuizAttempt } from "../models/quizAttempt.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const createQuiz = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { questions } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!questions || !Array.isArray(questions)) {
    throw new ApiError(400, "Questions array is required");
  }

  const quiz = await Quiz.create({ video: videoId, questions });

  res.status(201).json(new ApiResponse(201, quiz, "Quiz created"));
});

export const getQuizByVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const quiz = await Quiz.findOne({ video: videoId });

  if (!quiz) throw new ApiError(404, "Quiz not found for this video");

  res.status(200).json(new ApiResponse(200, quiz, "Quiz fetched"));
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { answers } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!Array.isArray(answers)) {
    throw new ApiError(400, "Answers must be an array");
  }

  const quiz = await Quiz.findOne({ video: videoId });
  if (!quiz) throw new ApiError(404, "Quiz not found");

  let score = 0;

  const results = answers
    .map((answer) => {
      const question = quiz.questions.find(
        (q) => q._id.toString() === answer.question.toString()
      );

      if (!question) return null;

      const selected = question.options.find(
        (opt) => opt._id.toString() === answer.selectedOption.toString()
      );

      if (selected?.isCorrect) score += 1;

      return {
        question: question._id,
        selectedOption: selected?._id || null,
        isCorrect: selected?.isCorrect || false,
      };
    })
    .filter(Boolean);

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    video: videoId,
    submittedAnswers: results.map((r) => ({
      question: r.question,
      selectedOption: r.selectedOption,
      isCorrect: r.isCorrect,
    })),
    score,
    total: quiz.questions.length,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers: score,
        result: results,
      },
      "Quiz submitted"
    )
  );
});
