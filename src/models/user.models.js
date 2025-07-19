import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String, //cloudinary URL
            required: true
        },
        coverImage: {
            type: String, //cloudinary URL
        },
        role: {
            type: String,
            enum: ["learner", "instructor"],
            default: "learner",
        },
        progress: [
            {
                video: { type: Schema.Types.ObjectId, ref: "Video" },
                progress: { type: Number, default: 0 },
            },
        ],
        bookmarks: [
            { 
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true , "Password is required"]
        },
        refreshToken: {
            type: String
        },
    }, 
    { timestamps: true}
)

//All middleware needs next
userSchema.pre("save", async function (next){ //triggering on save

    if(!this.isModified("password")) return next() //If password is not modifying, we return the function.

    this.password = await bcrypt.hash(this.password , 10)
    next()

})

//Comparing the encrypted password. Creating a custom instance method on your userSchema
// Returns a boolean value
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    //Short lived access token
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}

// Mongoose, create a new document or structure if not exist in my database named User
//Schema that is going to be followed is userSchema, defined.
export const User = mongoose.model("User" , userSchema)
