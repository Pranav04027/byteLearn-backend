import {v2 as cloudinary} from 'cloudinary';
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryDelete = async function (public_id , options){
    try {
        await cloudinary.uploader.destroy(public_id , options)
    } catch (error) {
        console.log("Could not delete the files")
    }
}

export {cloudinaryDelete}

/*
Use as:

await deleteCloudinaryFiles(avatar?.public_id, coverImage?.public_id)

Even though the function itself is marked async and uses await inside,
you still need to await it when calling it, because it returns a Promise.

*/