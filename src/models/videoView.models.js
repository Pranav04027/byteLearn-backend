import mongoose, { Schema } from "mongoose";

const videoViewSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    ip: {
      type: String
    }
  },
  { timestamps: true }
);

// Enforce uniqueness — either user or IP must be unique per video
videoViewSchema.index(
  { video: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $exists: true } } }
);

videoViewSchema.index(
  { video: 1, ip: 1 },
  { unique: true, partialFilterExpression: { ip: { $exists: true } } }
);

export const VideoView = mongoose.model("VideoView", videoViewSchema);
