import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      unique: true,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
