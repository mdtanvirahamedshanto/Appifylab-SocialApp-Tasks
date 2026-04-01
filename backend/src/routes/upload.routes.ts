import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadImageController, uploadSingleImage } from "../controllers/upload.controller.js";

const router = Router();

router.post("/image", requireAuth, uploadSingleImage, uploadImageController);

export default router;
