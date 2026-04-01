import { Router } from "express";
import authRoutes from "./auth.routes.js";
import feedRoutes from "./feed.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/feed", feedRoutes);
router.use("/uploads", uploadRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

export default router;
