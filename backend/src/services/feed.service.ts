import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { buildCursor, parseCursor, parseLimit } from "../utils/pagination.js";

export const PostVisibilityValues = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type PostVisibilityValue = (typeof PostVisibilityValues)[keyof typeof PostVisibilityValues];

export const LikeTypeValues = {
  POST: "POST",
  COMMENT: "COMMENT",
  REPLY: "REPLY",
} as const;

export type LikeTypeValue = (typeof LikeTypeValues)[keyof typeof LikeTypeValues];

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

const postBaseSelect = {
  id: true,
  content: true,
  imageUrl: true,
  visibility: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: userSelect,
  },
  likes: {
    select: {
      user: {
        select: userSelect,
      },
      userId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  },
} as const;

const buildFeedWhere = (userId: string, cursorInput?: string | null) => {
  const cursor = parseCursor(cursorInput);

  return {
    AND: [
      {
        OR: [{ visibility: PostVisibilityValues.PUBLIC }, { authorId: userId }],
      },
      ...(cursor
        ? [
            {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { lt: cursor.id } },
              ],
            },
          ]
        : []),
    ],
  };
};

const mapPost = (
  post: {
    id: string;
    content: string;
    imageUrl: string | null;
    visibility: PostVisibilityValue;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; firstName: string; lastName: string; email: string };
    likes: Array<{ userId: string; user: { id: string; firstName: string; lastName: string; email: string } }>;
  },
  viewerId: string,
) => ({
  id: post.id,
  content: post.content,
  imageUrl: post.imageUrl,
  visibility: post.visibility,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  author: post.author,
  viewerLiked: post.likes.some((like) => like.userId === viewerId),
  likedBy: post.likes.map((like) => like.user),
});

const mapComment = (
  comment: {
    id: string;
    content: string;
    likeCount: number;
    replyCount: number;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; firstName: string; lastName: string; email: string };
    likes: Array<{ userId: string; user: { id: string; firstName: string; lastName: string; email: string } }>;
    replies: Array<{
      id: string;
      content: string;
      likeCount: number;
      createdAt: Date;
      updatedAt: Date;
      author: { id: string; firstName: string; lastName: string; email: string };
      likes: Array<{ userId: string; user: { id: string; firstName: string; lastName: string; email: string } }>;
    }>;
  },
  viewerId: string,
) => ({
  id: comment.id,
  content: comment.content,
  likeCount: comment.likeCount,
  replyCount: comment.replyCount,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  author: comment.author,
  viewerLiked: comment.likes.some((like) => like.userId === viewerId),
  likedBy: comment.likes.map((like) => like.user),
  replies: comment.replies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    likeCount: reply.likeCount,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    author: reply.author,
    viewerLiked: reply.likes.some((like) => like.userId === viewerId),
    likedBy: reply.likes.map((like) => like.user),
  })),
});

export const getFeed = async (userId: string, cursor?: string | null, limit?: number | null) => {
  const pageSize = parseLimit(limit, 20, 50);

  const posts = await prisma.post.findMany({
    where: buildFeedWhere(userId, cursor),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    select: postBaseSelect,
  });

  const hasMore = posts.length > pageSize;
  const pagePosts = hasMore ? posts.slice(0, pageSize) : posts;
  const nextCursor = hasMore ? buildCursor(pagePosts.at(-1)!.createdAt, pagePosts.at(-1)!.id) : null;

  return {
    items: pagePosts.map((post) => mapPost(post, userId)),
    nextCursor,
    hasMore,
  };
};

export const createPost = async (input: {
  authorId: string;
  content: string;
  imageUrl?: string | null;
  visibility: PostVisibilityValue;
}) => {
  const post = await prisma.post.create({
    data: {
      authorId: input.authorId,
      content: input.content,
      imageUrl: input.imageUrl ?? null,
      visibility: input.visibility,
    },
    select: postBaseSelect,
  });

  return mapPost(post, input.authorId);
};

export const getPostById = async (postId: string, viewerId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      ...postBaseSelect,
      comments: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          content: true,
          likeCount: true,
          replyCount: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          author: {
            select: userSelect,
          },
          likes: {
            select: {
              userId: true,
              user: { select: userSelect },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          replies: {
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            select: {
              id: true,
              content: true,
              likeCount: true,
              createdAt: true,
              updatedAt: true,
              author: { select: userSelect },
              likes: {
                select: {
                  userId: true,
                  user: { select: userSelect },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
            },
          },
        },
      },
    },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.visibility === PostVisibilityValues.PRIVATE && post.authorId !== viewerId) {
    throw new AppError(403, "Forbidden");
  }

  return {
    ...mapPost(post, viewerId),
    comments: post.comments.map((comment) => mapComment(comment, viewerId)),
  };
};

export const getPostComments = async (input: {
  postId: string;
  viewerId: string;
  cursor?: string | null;
  limit?: number | null;
  repliesLimit?: number | null;
}) => {
  const pageSize = parseLimit(input.limit, 20, 50);
  const repliesLimit = parseLimit(input.repliesLimit, 5, 20);
  const cursor = parseCursor(input.cursor);

  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, visibility: true, authorId: true, commentCount: true },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.visibility === PostVisibilityValues.PRIVATE && post.authorId !== input.viewerId) {
    throw new AppError(403, "Forbidden");
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId: input.postId,
      ...(cursor
        ? {
            OR: [{ createdAt: { lt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { lt: cursor.id } }],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    select: {
      id: true,
      content: true,
      likeCount: true,
      replyCount: true,
      createdAt: true,
      updatedAt: true,
      author: { select: userSelect },
      likes: {
        select: {
          userId: true,
          user: { select: userSelect },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      replies: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: repliesLimit,
        select: {
          id: true,
          content: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          author: { select: userSelect },
          likes: {
            select: {
              userId: true,
              user: { select: userSelect },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  const hasMore = comments.length > pageSize;
  const items = hasMore ? comments.slice(0, pageSize) : comments;
  const nextCursor = hasMore ? buildCursor(items.at(-1)!.createdAt, items.at(-1)!.id) : null;

  return {
    items: items.map((comment) => mapComment(comment, input.viewerId)),
    nextCursor,
    hasMore,
    totalCount: post.commentCount,
  };
};

export const addComment = async (input: {
  postId: string;
  authorId: string;
  content: string;
}) => {
  const comment = await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: input.postId },
      select: { id: true, visibility: true, authorId: true },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.visibility === PostVisibilityValues.PRIVATE && post.authorId !== input.authorId) {
      throw new AppError(403, "Forbidden");
    }

    const createdComment = await tx.comment.create({
      data: {
        postId: input.postId,
        authorId: input.authorId,
        content: input.content,
      },
      select: {
        id: true,
        content: true,
        likeCount: true,
        replyCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: userSelect },
      },
    });

    await tx.post.update({
      where: { id: input.postId },
      data: { commentCount: { increment: 1 } },
    });

    return createdComment;
  });

  return {
    ...comment,
    viewerLiked: false,
    likedBy: [],
    replies: [],
  };
};

export const addReply = async (input: {
  commentId: string;
  authorId: string;
  content: string;
}) => {
  const reply = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.findUnique({
      where: { id: input.commentId },
      select: {
        id: true,
        post: {
          select: {
            id: true,
            visibility: true,
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.post.visibility === PostVisibilityValues.PRIVATE && comment.post.authorId !== input.authorId) {
      throw new AppError(403, "Forbidden");
    }

    const createdReply = await tx.reply.create({
      data: {
        commentId: input.commentId,
        authorId: input.authorId,
        content: input.content,
      },
      select: {
        id: true,
        content: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: userSelect },
      },
    });

    await tx.comment.update({
      where: { id: input.commentId },
      data: { replyCount: { increment: 1 } },
    });

    return createdReply;
  });

  return {
    ...reply,
    viewerLiked: false,
    likedBy: [],
  };
};

type LikeTarget =
  | { type: LikeTypeValue; targetId: string }
  | { type: LikeTypeValue; targetId: string }
  | { type: LikeTypeValue; targetId: string };

const ensureLikeTargetAccessible = async (tx: any, input: { userId: string } & LikeTarget) => {
  if (input.type === LikeTypeValues.POST) {
    const post = await tx.post.findUnique({
      where: { id: input.targetId },
      select: { id: true, visibility: true, authorId: true },
    });

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.visibility === PostVisibilityValues.PRIVATE && post.authorId !== input.userId) {
      throw new AppError(403, "Forbidden");
    }

    return;
  }

  if (input.type === LikeTypeValues.COMMENT) {
    const comment = await tx.comment.findUnique({
      where: { id: input.targetId },
      select: {
        id: true,
        post: { select: { id: true, visibility: true, authorId: true } },
      },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.post.visibility === PostVisibilityValues.PRIVATE && comment.post.authorId !== input.userId) {
      throw new AppError(403, "Forbidden");
    }

    return;
  }

  const reply = await tx.reply.findUnique({
    where: { id: input.targetId },
    select: {
      id: true,
      comment: {
        select: {
          id: true,
          post: { select: { id: true, visibility: true, authorId: true } },
        },
      },
    },
  });

  if (!reply) {
    throw new AppError(404, "Reply not found");
  }

  if (reply.comment.post.visibility === PostVisibilityValues.PRIVATE && reply.comment.post.authorId !== input.userId) {
    throw new AppError(403, "Forbidden");
  }
};

const getLikeWhere = (userId: string, target: LikeTarget) => {
  if (target.type === LikeTypeValues.POST) {
    return { userId_postId: { userId, postId: target.targetId } };
  }

  if (target.type === LikeTypeValues.COMMENT) {
    return { userId_commentId: { userId, commentId: target.targetId } };
  }

  return { userId_replyId: { userId, replyId: target.targetId } };
};

const createLikeData = (input: { userId: string } & LikeTarget) => {
  if (input.type === LikeTypeValues.POST) {
    return { userId: input.userId, type: input.type, postId: input.targetId } as const;
  }

  if (input.type === LikeTypeValues.COMMENT) {
    return { userId: input.userId, type: input.type, commentId: input.targetId } as const;
  }

  return { userId: input.userId, type: input.type, replyId: input.targetId } as const;
};

const updateLikeCounter = async (tx: Prisma.TransactionClient, target: LikeTarget, operation: "increment" | "decrement") => {
  const data = { likeCount: { [operation]: 1 } } as const;

  if (target.type === LikeTypeValues.POST) {
    await tx.post.update({ where: { id: target.targetId }, data });
    return;
  }

  if (target.type === LikeTypeValues.COMMENT) {
    await tx.comment.update({ where: { id: target.targetId }, data });
    return;
  }

  await tx.reply.update({ where: { id: target.targetId }, data });
};

const getTargetSelect = (target: LikeTarget) => {
  if (target.type === LikeTypeValues.POST) {
    return {
      id: true,
      likeCount: true,
      author: { select: userSelect },
      likes: { select: { userId: true, user: { select: userSelect } }, orderBy: { createdAt: "desc" }, take: 10 },
    } as const;
  }

  if (target.type === LikeTypeValues.COMMENT) {
    return {
      id: true,
      likeCount: true,
      author: { select: userSelect },
      likes: { select: { userId: true, user: { select: userSelect } }, orderBy: { createdAt: "desc" }, take: 10 },
    } as const;
  }

  return {
    id: true,
    likeCount: true,
    author: { select: userSelect },
    likes: { select: { userId: true, user: { select: userSelect } }, orderBy: { createdAt: "desc" }, take: 10 },
  } as const;
};

const findTargetOrThrow = async (tx: Prisma.TransactionClient, target: LikeTarget) => {
  if (target.type === LikeTypeValues.POST) {
    const post = await tx.post.findUnique({ where: { id: target.targetId }, select: getTargetSelect(target) });
    if (!post) throw new AppError(404, "Post not found");
    return post;
  }

  if (target.type === LikeTypeValues.COMMENT) {
    const comment = await tx.comment.findUnique({ where: { id: target.targetId }, select: getTargetSelect(target) });
    if (!comment) throw new AppError(404, "Comment not found");
    return comment;
  }

  const reply = await tx.reply.findUnique({ where: { id: target.targetId }, select: getTargetSelect(target) });
  if (!reply) throw new AppError(404, "Reply not found");
  return reply;
};

export const toggleLike = async (input: { userId: string } & LikeTarget) => {
  return prisma.$transaction(async (tx) => {
    await ensureLikeTargetAccessible(tx, input);

    const likeWhere = getLikeWhere(input.userId, input);
    const existing = await tx.like.findUnique({ where: likeWhere, select: { id: true } });

    let liked = false;
    if (existing) {
      await tx.like.delete({ where: likeWhere });
      await updateLikeCounter(tx, input, "decrement");
      liked = false;
    } else {
      await tx.like.create({ data: createLikeData(input) });
      await updateLikeCounter(tx, input, "increment");
      liked = true;
    }

    const target = await findTargetOrThrow(tx, { type: input.type, targetId: input.targetId });

    return {
      liked,
      likeCount: target.likeCount,
      likedBy: target.likes.map((like: { user: { id: string; firstName: string; lastName: string; email: string } }) => like.user),
      viewerLiked: target.likes.some((like: { userId: string }) => like.userId === input.userId),
    };
  });
};
