import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEYS,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadOncloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        })
        // Delete the file from local storage after successful upload
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        // Delete the local file even if upload fails
        fs.unlinkSync(localFilePath)
    }
}

export {uploadOncloudinary}