import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null

         //Returns a Big Object containing a lot including URL accessed using dot
        const response = await cloudinary.uploader.upload(localFilePath , {resource_type: "auto",}
        )
        console.log("file Uploaded on cloudinary" + response.url)

        // Once the file is uploaded, we want to delete from our servers
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const uploadVideoOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null

         //Returns a Big Object containing a lot including URL accessed using dot
        const response = await cloudinary.uploader.upload(localFilePath , {resource_type: "video",}
        )
        console.log("file Uploaded on cloudinary" + response.url)

        // Once the file is uploaded, we want to delete from our servers
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary , uploadVideoOnCloudinary}