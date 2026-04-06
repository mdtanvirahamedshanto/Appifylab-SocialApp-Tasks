import { AppError } from "../utils/AppError.js";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";

export const uploadImageBuffer = async (file: Express.Multer.File) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError(500, "Image upload is not configured");
  }

  return new Promise<{ secureUrl: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError(500, error?.message ?? "Failed to upload image"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
};
