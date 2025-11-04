import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, mimetype) => {
  try {
    if (!localFilePath) return null;

    let resourceType = "raw";
    let uploadOptions = {
      folder: "documents",
      use_filename: true,
      unique_filename: true,
    };

    // Determine resource type based on mime type
    if (mimetype?.startsWith("image/")) {
      resourceType = "image";
    } else if (mimetype?.startsWith("video/")) {
      resourceType = "video";
    } else {
      // For PDFs and other documents
      resourceType = "raw";
      // Remove attachment flag to allow inline viewing
      uploadOptions.flags = undefined;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      ...uploadOptions,
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary };
