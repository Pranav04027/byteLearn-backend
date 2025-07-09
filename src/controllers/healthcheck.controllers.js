import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async( req , res) => { //doesn't use next directly, it's still passed in by asyncHandler
    //Logic of the endpoint
    return res.status(200).json(new ApiResponse(200 , "OK" , "Health check passed"))
})

export {healthcheck}