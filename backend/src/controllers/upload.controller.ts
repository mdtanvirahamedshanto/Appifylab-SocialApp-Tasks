import type { Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { uploadImageBuffer } from "../services/upload.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadSingleImage = upload.single("file");

export const uploadImageController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, "Image file is required");
  }

  const fileSchema = z.object({
    mimetype: z.string().refine((value) => value.startsWith("image/"), "Only image files are allowed"),
  });

  fileSchema.parse(req.file);

  const result = await uploadImageBuffer(req.file);

  res.status(201).json({
    success: true,
    imageUrl: result.secureUrl,
    publicId: result.publicId,
  });
});
