import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { feedWriteRateLimiter } from "../middleware/rateLimiter.js";
import {
  addCommentController,
  getPostCommentsController,
  addReplyController,
  createPostController,
  feedController,
  getPostController,
  toggleLikeController,
} from "../controllers/feed.controller.js";

const router = Router();

router.get("/", requireAuth, feedController);
router.post("/posts", requireAuth, feedWriteRateLimiter, createPostController);
router.get("/posts/:postId", requireAuth, getPostController);
router.get("/posts/:postId/comments", requireAuth, getPostCommentsController);
router.post("/posts/:postId/comments", requireAuth, feedWriteRateLimiter, addCommentController);
router.post("/comments/:commentId/replies", requireAuth, feedWriteRateLimiter, addReplyController);
router.post("/likes/toggle", requireAuth, feedWriteRateLimiter, toggleLikeController);

export default router;
