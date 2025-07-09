// You can just add this to any route and enjoy getting user in the req.

import jwt from "jsonwebtoken"
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"

// We injected the req with user.
const verifyJWT = asyncHandler(async (req , res , next) => {

    //2 possible places where clint can send JWT access tokens
    const token = req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer " , "") // Removes bearer  to get tokens

    if(!token){
        throw new ApiError(401, "Unauthorized")
    }

    try {
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET) //Varifies and decodes.

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Unauthorized")
        }

        req.user = user // Add user field to the req

        next()

    } catch (error) {
        throw new ApiError(401 , "Unauthorized")
    }

})

export {verifyJWT}