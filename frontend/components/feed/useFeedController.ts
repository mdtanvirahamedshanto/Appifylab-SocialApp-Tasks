import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";
import type { ApiComment, ApiPost, ApiUser, LikeType, PostVisibility } from "../../lib/types";

interface UseFeedControllerOptions {
  user: ApiUser | null;
}

export function useFeedController({ user }: UseFeedControllerOptions) {
  const detailsRequestCacheRef = useRef<Map<string, Promise<void>>>(new Map());
  const preloadedPostIdsRef = useRef<Set<string>>(new Set());

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [composerContent, setComposerContent] = useState("");
  const [composerVisibility, setComposerVisibility] = useState<PostVisibility>("PUBLIC");
  const [composerFile, setComposerFile] = useState<File | null>(null);
  const [composerBusy, setComposerBusy] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [showAllComments, setShowAllComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openReplyBoxes, setOpenReplyBoxes] = useState<Record<string, boolean>>({});
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});
  const [shareCountByPost, setShareCountByPost] = useState<Record<string, number>>({});
  const [shareStatusByPost, setShareStatusByPost] = useState<Record<string, string>>({});

  const setBusy = useCallback((key: string, busy: boolean) => {
    setActionBusy((prev) => ({ ...prev, [key]: busy }));
  }, []);

  const updatePost = useCallback((postId: string, updater: (post: ApiPost) => ApiPost) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? updater(post) : post)));
  }, []);

  const loadFeed = useCallback(async (cursor?: string | null) => {
    const result = await api.getFeed(cursor ?? null, 20);
    setPosts((prev) => (cursor ? [...prev, ...result.items] : result.items));
    setNextCursor(result.nextCursor);
    setHasMore(result.hasMore);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setFeedLoading(true);
      setFeedError(null);
      try {
        await loadFeed();
      } catch {
        if (mounted) setFeedError("Unable to load feed right now.");
      } finally {
        if (mounted) setFeedLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadFeed]);

  const ensurePostDetails = useCallback(
    async (postId: string) => {
      const existing = posts.find((post) => post.id === postId);
      if (existing?.comments) return;

      const inflight = detailsRequestCacheRef.current.get(postId);
      if (inflight) {
        await inflight;
        return;
      }

      const request = (async () => {
        const detail = await api.getPost(postId);
        setPosts((prev) => prev.map((post) => (post.id === postId ? detail : post)));
      })();

      detailsRequestCacheRef.current.set(postId, request);

      try {
        await request;
      } finally {
        detailsRequestCacheRef.current.delete(postId);
      }
    },
    [posts],
  );

  useEffect(() => {
    if (feedLoading || posts.length === 0) return;

    const candidates = posts.filter((post) => !post.comments).slice(0, 2);

    for (const post of candidates) {
      if (preloadedPostIdsRef.current.has(post.id)) continue;
      preloadedPostIdsRef.current.add(post.id);
      void ensurePostDetails(post.id).catch(() => {
        // Ignore prefetch failures; explicit expand will retry.
      });
    }
  }, [ensurePostDetails, feedLoading, posts]);

  const handleCreatePost = useCallback(async () => {
    if (composerBusy) return;

    if (!composerContent.trim() && !composerFile) {
      setComposerError("Write something or choose an image.");
      return;
    }

    const content = composerContent.trim() || "Image post";
    const file = composerFile;
    const visibility = composerVisibility;
    const tempId = `temp-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const optimisticAuthor = user ?? {
      id: "optimistic-user",
      firstName: "You",
      lastName: "",
      email: "you@example.com",
    };

    const optimisticPost: ApiPost = {
      id: tempId,
      content,
      imageUrl: file ? URL.createObjectURL(file) : null,
      visibility,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
      author: optimisticAuthor,
      viewerLiked: false,
      likedBy: [],
      comments: [],
    };

    setComposerBusy(true);
    setComposerError(null);
    setComposerContent("");
    setComposerVisibility("PUBLIC");
    setComposerFile(null);
    setPosts((prev) => [optimisticPost, ...prev]);

    try {
      let imageUrl: string | null = null;
      if (file) {
        const upload = await api.uploadImage(file);
        imageUrl = upload.imageUrl;
      }

      const created = await api.createPost({
        content,
        imageUrl,
        visibility,
      });

      setPosts((prev) => prev.map((post) => (post.id === tempId ? created : post)));
    } catch {
      setPosts((prev) => prev.filter((post) => post.id !== tempId));
      setComposerContent(content);
      setComposerVisibility(visibility);
      setComposerFile(file);
      setComposerError("Unable to publish post right now.");
    } finally {
      if (optimisticPost.imageUrl) {
        URL.revokeObjectURL(optimisticPost.imageUrl);
      }
      setComposerBusy(false);
    }
  }, [composerBusy, composerContent, composerFile, composerVisibility, user]);

  const handleToggleComments = useCallback(
    async (postId: string) => {
      const key = `comments:${postId}`;
      const next = !expandedPosts[postId];
      setExpandedPosts((prev) => ({ ...prev, [postId]: next }));
      if (!next) return;

      setBusy(key, true);
      try {
        await ensurePostDetails(postId);
      } catch {
        setFeedError("Unable to load comments.");
      } finally {
        setBusy(key, false);
      }
    },
    [ensurePostDetails, expandedPosts, setBusy],
  );

  const handleSharePost = useCallback(
    async (postId: string, content: string) => {
      const busyKey = `share:${postId}`;
      if (actionBusy[busyKey]) return;

      setBusy(busyKey, true);
      const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/feed?post=${postId}` : `/feed?post=${postId}`;

      try {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          await navigator.share({
            title: "Buddy Social Post",
            text: content.slice(0, 140),
            url: shareUrl,
          });
          setShareStatusByPost((prev) => ({ ...prev, [postId]: "Shared" }));
        } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          setShareStatusByPost((prev) => ({ ...prev, [postId]: "Link copied" }));
        } else {
          throw new Error("Share is not supported");
        }

        setShareCountByPost((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
        window.setTimeout(() => {
          setShareStatusByPost((prev) => ({ ...prev, [postId]: "" }));
        }, 2200);
      } catch {
        setFeedError("Unable to share right now.");
      } finally {
        setBusy(busyKey, false);
      }
    },
    [actionBusy, setBusy],
  );

  const handleToggleLike = useCallback(
    async (type: LikeType, targetId: string, postId: string) => {
      const busyKey = `like:${type}:${targetId}`;
      if (actionBusy[busyKey]) return;

      setBusy(busyKey, true);

      let rollbackPost: ApiPost | null = null;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          rollbackPost = post;
          if (type === "POST") {
            const nextLiked = !post.viewerLiked;
            return {
              ...post,
              viewerLiked: nextLiked,
              likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
            };
          }

          return {
            ...post,
            comments: (post.comments ?? []).map((comment) => {
              if (type === "COMMENT" && comment.id === targetId) {
                const nextLiked = !comment.viewerLiked;
                return {
                  ...comment,
                  viewerLiked: nextLiked,
                  likeCount: Math.max(0, comment.likeCount + (nextLiked ? 1 : -1)),
                };
              }

              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (type === "REPLY" && reply.id === targetId) {
                    const nextLiked = !reply.viewerLiked;
                    return {
                      ...reply,
                      viewerLiked: nextLiked,
                      likeCount: Math.max(0, reply.likeCount + (nextLiked ? 1 : -1)),
                    };
                  }

                  return reply;
                }),
              };
            }),
          };
        }),
      );

      try {
        const result = await api.toggleLike(type, targetId);
        updatePost(postId, (post) => {
          if (type === "POST") {
            return {
              ...post,
              likeCount: result.likeCount,
              viewerLiked: result.viewerLiked,
              likedBy: result.likedBy,
            };
          }

          return {
            ...post,
            comments: (post.comments ?? []).map((comment) => {
              if (type === "COMMENT" && comment.id === targetId) {
                return {
                  ...comment,
                  likeCount: result.likeCount,
                  viewerLiked: result.viewerLiked,
                  likedBy: result.likedBy,
                };
              }

              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  type === "REPLY" && reply.id === targetId
                    ? {
                        ...reply,
                        likeCount: result.likeCount,
                        viewerLiked: result.viewerLiked,
                        likedBy: result.likedBy,
                      }
                    : reply,
                ),
              };
            }),
          };
        });
      } catch {
        if (rollbackPost) {
          setPosts((prev) => prev.map((post) => (post.id === postId ? rollbackPost! : post)));
        }
        setFeedError("Unable to update like right now.");
      } finally {
        setBusy(busyKey, false);
      }
    },
    [actionBusy, setBusy, updatePost],
  );

  const handleAddComment = useCallback(
    async (postId: string) => {
      const content = (commentInputs[postId] ?? "").trim();
      if (!content) return;

      const busyKey = `comment:${postId}`;
      if (actionBusy[busyKey]) return;

      setBusy(busyKey, true);

      const tempId = `temp-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const optimisticAuthor = user ?? {
        id: "optimistic-user",
        firstName: "You",
        lastName: "",
        email: "you@example.com",
      };
      const optimisticComment: ApiComment = {
        id: tempId,
        content,
        likeCount: 0,
        replyCount: 0,
        createdAt: now,
        updatedAt: now,
        author: optimisticAuthor,
        viewerLiked: false,
        likedBy: [],
        replies: [],
      };

      let rollbackPost: ApiPost | null = null;
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          rollbackPost = post;

          return {
            ...post,
            commentCount: post.commentCount + 1,
            comments: [optimisticComment, ...(post.comments ?? [])],
          };
        }),
      );

      try {
        const created = await api.addComment(postId, content);

        updatePost(postId, (post) => ({
          ...post,
          comments: (post.comments ?? []).map((comment) => (comment.id === tempId ? created : comment)),
        }));
      } catch {
        if (rollbackPost) {
          setPosts((prev) => prev.map((post) => (post.id === postId ? rollbackPost! : post)));
        }
        setCommentInputs((prev) => ({ ...prev, [postId]: content }));
        setFeedError("Unable to add comment right now.");
      } finally {
        setBusy(busyKey, false);
      }
    },
    [actionBusy, commentInputs, setBusy, updatePost, user],
  );

  const handleAddReply = useCallback(
    async (postId: string, commentId: string) => {
      const key = `${postId}:${commentId}`;
      const content = (replyInputs[key] ?? "").trim();
      if (!content) return;

      const busyKey = `reply:${key}`;
      if (actionBusy[busyKey]) return;

      setBusy(busyKey, true);

      const tempId = `temp-reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const optimisticAuthor = user ?? {
        id: "optimistic-user",
        firstName: "You",
        lastName: "",
        email: "you@example.com",
      };

      let rollbackPost: ApiPost | null = null;
      setReplyInputs((prev) => ({ ...prev, [key]: "" }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          rollbackPost = post;

          return {
            ...post,
            comments: (post.comments ?? []).map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    replyCount: comment.replyCount + 1,
                    replies: [
                      ...comment.replies,
                      {
                        id: tempId,
                        content,
                        likeCount: 0,
                        createdAt: now,
                        updatedAt: now,
                        author: optimisticAuthor,
                        viewerLiked: false,
                        likedBy: [],
                      },
                    ],
                  }
                : comment,
            ),
          };
        }),
      );

      try {
        const created = await api.addReply(commentId, content);

        updatePost(postId, (post) => ({
          ...post,
          comments: (post.comments ?? []).map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.map((reply) => (reply.id === tempId ? created : reply)),
                }
              : comment,
          ),
        }));
      } catch {
        if (rollbackPost) {
          setPosts((prev) => prev.map((post) => (post.id === postId ? rollbackPost! : post)));
        }
        setReplyInputs((prev) => ({ ...prev, [key]: content }));
        setFeedError("Unable to add reply right now.");
      } finally {
        setBusy(busyKey, false);
      }
    },
    [actionBusy, replyInputs, setBusy, updatePost, user],
  );

  const setCommentInput = useCallback((postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  }, []);

  const setReplyInput = useCallback((postId: string, commentId: string, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [`${postId}:${commentId}`]: value }));
  }, []);

  const showAllCommentsForPost = useCallback((postId: string) => {
    setShowAllComments((prev) => ({ ...prev, [postId]: true }));
  }, []);

  const toggleReplyBox = useCallback((postId: string, commentId: string) => {
    const key = `${postId}:${commentId}`;
    setOpenReplyBoxes((prev) => {
      const nextOpen = !prev[key];

      if (nextOpen) {
        setReplyInputs((prevInputs) => {
          if (Object.prototype.hasOwnProperty.call(prevInputs, key)) {
            return prevInputs;
          }

          return { ...prevInputs, [key]: "" };
        });
      }

      return {
        ...prev,
        [key]: nextOpen,
      };
    });
  }, []);

  const handleLoadMore = useCallback(async () => {
    setBusy("loadMore", true);
    try {
      await loadFeed(nextCursor);
    } catch {
      setFeedError("Unable to load more posts right now.");
    } finally {
      setBusy("loadMore", false);
    }
  }, [loadFeed, nextCursor, setBusy]);

  const totalPosts = useMemo(() => posts.length, [posts.length]);

  return {
    posts,
    feedLoading,
    feedError,
    hasMore,
    nextCursor,
    totalPosts,
    composerContent,
    composerVisibility,
    composerFile,
    composerBusy,
    composerError,
    expandedPosts,
    showAllComments,
    commentInputs,
    replyInputs,
    openReplyBoxes,
    actionBusy,
    shareCountByPost,
    shareStatusByPost,
    setComposerContent,
    setComposerVisibility,
    setComposerFile,
    setCommentInput,
    setReplyInput,
    showAllCommentsForPost,
    toggleReplyBox,
    handleCreatePost,
    handleToggleComments,
    handleSharePost,
    handleToggleLike,
    handleAddComment,
    handleAddReply,
    handleLoadMore,
  };
}
