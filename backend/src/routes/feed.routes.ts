import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  addCommentController,
  addReplyController,
  createPostController,
  feedController,
  getPostController,
  toggleLikeController,
} from "../controllers/feed.controller.js";

const router = Router();

router.get("/", requireAuth, feedController);
router.post("/posts", requireAuth, createPostController);
router.get("/posts/:postId", requireAuth, getPostController);
router.post("/posts/:postId/comments", requireAuth, addCommentController);
router.post("/comments/:commentId/replies", requireAuth, addReplyController);
router.post("/likes/toggle", requireAuth, toggleLikeController);

export default router;
