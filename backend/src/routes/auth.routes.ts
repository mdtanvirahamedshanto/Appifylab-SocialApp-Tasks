import { Router } from "express";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";
import { loginController, logoutController, meController, refreshController, registerController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authRateLimiter, registerController);
router.post("/login", authRateLimiter, loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);

export default router;
