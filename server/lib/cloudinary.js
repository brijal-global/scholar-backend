import { cloudinary } from "../../configs/env.config.js";
import { v2 as cloudinaryConfig } from "cloudinary";
import streamifier from "streamifier";

cloudinaryConfig.config({
  cloud_name: cloudinary.cloudName,
  api_key: cloudinary.apiKey,
  api_secret: cloudinary.apiSecret,
});

export const uploadToCloudinary = async (req, res) => {
  try {
    if (!req.files) return;

    const uploadFile = (buffer, folder) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinaryConfig.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const uploadedFiles = {};

    for (const file of req.files) {
      const folderName = `${file.fieldname || "other"}s`;

      const cloudinaryUrl = await uploadFile(file.buffer, folderName);

      uploadedFiles[file.fieldname] = cloudinaryUrl;
    }

    req.body = { ...req.body, ...uploadedFiles };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return res.status(500).json({ message: "File upload failed", error });
  }
};
