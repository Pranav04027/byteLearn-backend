import mongoose, {Schema} from "mongoose";

const postSchema = new Schema(
    {
        content: {
            type: String,
            requied: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    }, {timestamps: true}
)

export const Post = mongoose.model("Post" , postSchema)