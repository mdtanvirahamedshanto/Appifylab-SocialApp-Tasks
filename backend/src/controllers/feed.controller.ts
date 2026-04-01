import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addComment,
  addReply,
  createPost,
  getFeed,
  getPostById,
  toggleLike,
  LikeTypeValues,
  PostVisibilityValues,
} from "../services/feed.service.js";

const feedQuerySchema = z.object({
  cursor: z.string().optional().nullable(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  imageUrl: z.string().url().optional().nullable(),
  visibility: z.enum([PostVisibilityValues.PUBLIC, PostVisibilityValues.PRIVATE]),
});

const commentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

const replySchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

const likeSchema = z.object({
  type: z.enum([LikeTypeValues.POST, LikeTypeValues.COMMENT, LikeTypeValues.REPLY]),
  targetId: z.string().min(1),
});

export const feedController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const parsed = feedQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const data = await getFeed(req.authUser.id, parsed.data.cursor, parsed.data.limit);

  res.status(200).json({
    success: true,
    ...data,
  });
});

export const createPostController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const parsed = createPostSchema.parse(req.body);
  const post = await createPost({
    authorId: req.authUser.id,
    content: parsed.content,
    imageUrl: parsed.imageUrl ?? null,
    visibility: parsed.visibility,
  });

  res.status(201).json({ success: true, post });
});

export const getPostController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const postId = z.string().min(1).parse(req.params.postId);
  const post = await getPostById(postId, req.authUser.id);

  res.status(200).json({ success: true, post });
});

export const addCommentController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const postId = z.string().min(1).parse(req.params.postId);
  const parsed = commentSchema.parse(req.body);
  const comment = await addComment({ postId, authorId: req.authUser.id, content: parsed.content });

  res.status(201).json({ success: true, comment });
});

export const addReplyController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const commentId = z.string().min(1).parse(req.params.commentId);
  const parsed = replySchema.parse(req.body);
  const reply = await addReply({ commentId, authorId: req.authUser.id, content: parsed.content });

  res.status(201).json({ success: true, reply });
});

export const toggleLikeController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const parsed = likeSchema.parse(req.body);
  const result = await toggleLike({
    userId: req.authUser.id,
    type: parsed.type,
    targetId: parsed.targetId,
  });

  res.status(200).json({ success: true, ...result });
});
