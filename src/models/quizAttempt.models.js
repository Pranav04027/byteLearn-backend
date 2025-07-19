import mongoose, { Schema } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },
    score: { 
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    submittedAnswers: [
      {
        question: String,
        selectedOption: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
