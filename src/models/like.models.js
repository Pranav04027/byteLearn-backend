import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post"
    }
  },
  { timestamps: true }
);

// Ensure one like per user per video
likeSchema.index(
  { likedBy: 1, video: 1 },
  { unique: true, partialFilterExpression: { video: { $exists: true } } }
);

// Ensure one like per user per comment
likeSchema.index(
  { likedBy: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } }
);

// Ensure one like per user per post
likeSchema.index(
  { likedBy: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true } } }
);

export const Like = mongoose.model("Like", likeSchema);