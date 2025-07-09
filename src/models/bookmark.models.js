import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent double-bookmarking
bookmarkSchema.index({ user: 1, video: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
