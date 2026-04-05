"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../providers";
import type { ApiComment, ApiPost, LikeType, PostVisibility } from "../../lib/types";

const storyCards = ["card_ppl2.png", "card_ppl3.png", "card_ppl4.png"];

const formatRelative = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour ago`;

  const days = Math.floor(hours / 24);
  return `${days} day ago`;
};

const toName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim();

const likedByText = (users: Array<{ firstName: string; lastName: string }>) => {
  if (!users.length) return "No likes yet";
  return users.slice(0, 5).map(toName).join(", ");
};

export default function MiddleColumn() {
  const auth = useAuth();

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
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

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

      const detail = await api.getPost(postId);
      setPosts((prev) => prev.map((post) => (post.id === postId ? detail : post)));
    },
    [posts],
  );

  const handleCreatePost = useCallback(async () => {
    if (!composerContent.trim() && !composerFile) {
      setComposerError("Write something or choose an image.");
      return;
    }

    setComposerBusy(true);
    setComposerError(null);
    try {
      let imageUrl: string | null = null;
      if (composerFile) {
        const upload = await api.uploadImage(composerFile);
        imageUrl = upload.imageUrl;
      }

      const created = await api.createPost({
        content: composerContent.trim() || "Image post",
        imageUrl,
        visibility: composerVisibility,
      });

      setPosts((prev) => [created, ...prev]);
      setComposerContent("");
      setComposerVisibility("PUBLIC");
      setComposerFile(null);
    } catch {
      setComposerError("Unable to publish post right now.");
    } finally {
      setComposerBusy(false);
    }
  }, [composerContent, composerFile, composerVisibility]);

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

  const handleToggleLike = useCallback(
    async (type: LikeType, targetId: string, postId: string) => {
      const busyKey = `like:${type}:${targetId}`;
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
    [setBusy, updatePost],
  );

  const handleAddComment = useCallback(
    async (postId: string) => {
      const content = (commentInputs[postId] ?? "").trim();
      if (!content) return;

      const busyKey = `comment:${postId}`;
      setBusy(busyKey, true);

      const tempId = `temp-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const optimisticAuthor = auth.user ?? {
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
    [auth.user, commentInputs, setBusy, updatePost],
  );

  const handleAddReply = useCallback(
    async (postId: string, commentId: string) => {
      const key = `${postId}:${commentId}`;
      const content = (replyInputs[key] ?? "").trim();
      if (!content) return;

      const busyKey = `reply:${key}`;
      setBusy(busyKey, true);

      const tempId = `temp-reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const optimisticAuthor = auth.user ?? {
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
    [auth.user, replyInputs, setBusy, updatePost],
  );

  const totalPosts = useMemo(() => posts.length, [posts.length]);

  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        <div className="_feed_inner_ppl_card _mar_b16">
          <div className="_feed_inner_story_arrow">
            <button type="button" className="_feed_inner_story_arrow_btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
              </svg>
            </button>
          </div>
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
              <div className="_feed_inner_profile_story _b_radious6">
                <div className="_feed_inner_profile_story_image">
                  <img src="/buddy-script/assets/images/card_ppl1.png" alt="Image" className="_profile_story_img" />
                  <div className="_feed_inner_story_txt">
                    <div className="_feed_inner_story_btn">
                      <button className="_feed_inner_story_btn_link" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                          <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                        </svg>
                      </button>
                    </div>
                    <p className="_feed_inner_story_para">Your Story</p>
                  </div>
                </div>
              </div>
            </div>
            {storyCards.map((story, index) => (
              <div key={story} className={`col-xl-3 col-lg-3 col-md-4 col-sm-4 ${index === 1 ? "_custom_mobile_none" : "_custom_none"}`}>
                <div className="_feed_inner_public_story _b_radious6">
                  <div className="_feed_inner_public_story_image">
                    <img src={`/buddy-script/assets/images/${story}`} alt="Image" className="_public_story_img" />
                    <div className="_feed_inner_pulic_story_txt">
                      <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
                    </div>
                    <div className="_feed_inner_public_mini">
                      <img src="/buddy-script/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
          <div className="_feed_inner_text_area_box">
            <div className="_feed_inner_text_area_box_image">
              <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_txt_img" />
            </div>
            <div className="form-floating _feed_inner_text_area_box_form">
              <textarea
                className="form-control _textarea"
                id="postComposer"
                placeholder="Leave a comment here"
                value={composerContent}
                onChange={(event) => setComposerContent(event.target.value)}
              />
              <label className="_feed_textarea_label" htmlFor="postComposer">
                Write something ...
              </label>
            </div>
          </div>

          <div className="_feed_inner_text_area_bottom">
            <div className="_feed_inner_text_area_item">
              <div className="_feed_inner_text_area_bottom_photo _feed_common">
                <label className="_feed_inner_text_area_bottom_photo_link">
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => setComposerFile(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div className="_feed_inner_text_area_bottom_event _feed_common">
                <select
                  className="_feed_inner_text_area_bottom_photo_link"
                  value={composerVisibility}
                  onChange={(event) => setComposerVisibility(event.target.value as PostVisibility)}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>
            <div className="_feed_inner_text_area_btn">
              <button type="button" className="_feed_inner_text_area_btn_link" onClick={handleCreatePost} disabled={composerBusy}>
                <span>{composerBusy ? "Posting..." : "Post"}</span>
              </button>
            </div>
          </div>

          {composerFile ? <p className="_mar_t8 text-sm">Selected image: {composerFile.name}</p> : null}
          {composerError ? <p className="_mar_t8 text-sm text-rose-500">{composerError}</p> : null}
        </div>

        {feedError ? <p className="_mar_b16 text-sm text-rose-500">{feedError}</p> : null}
        {feedLoading ? <p className="_mar_b16">Loading feed...</p> : null}

        {posts.map((post) => (
          <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16" key={post.id}>
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
              <div className="_feed_inner_timeline_post_top">
                <div className="_feed_inner_timeline_post_box">
                  <div className="_feed_inner_timeline_post_box_image">
                    <img src="/buddy-script/assets/images/post_img.png" alt="Image" className="_post_img" />
                  </div>
                  <div className="_feed_inner_timeline_post_box_txt">
                    <h4 className="_feed_inner_timeline_post_box_title">{toName(post.author)}</h4>
                    <p className="_feed_inner_timeline_post_box_para">
                      {formatRelative(post.createdAt)} . <a href="#0">{post.visibility}</a>
                    </p>
                  </div>
                </div>
              </div>
              <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
              {post.imageUrl ? (
                <div className="_feed_inner_timeline_image">
                  <img src={post.imageUrl} alt="Post" className="_time_img" />
                </div>
              ) : null}
            </div>

            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
              <div className="_feed_inner_timeline_total_reacts_image">
                <img src="/buddy-script/assets/images/react_img1.png" alt="Image" className="_react_img1" />
                <p className="_feed_inner_timeline_total_reacts_para">{post.likeCount}</p>
              </div>
              <div className="_feed_inner_timeline_total_reacts_txt">
                <p className="_feed_inner_timeline_total_reacts_para1">
                  <a href="#0">
                    <span>{post.commentCount}</span> Comment
                  </a>
                </p>
              </div>
            </div>

            <div className="_feed_inner_timeline_reaction">
              <button
                className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.viewerLiked ? "_feed_reaction_active" : ""}`}
                type="button"
                disabled={!!actionBusy[`like:POST:${post.id}`]}
                onClick={() => handleToggleLike("POST", post.id, post.id)}
              >
                <span className="_feed_inner_timeline_reaction_link">{post.viewerLiked ? "Unlike" : "Like"}</span>
              </button>
              <button className="_feed_inner_timeline_reaction_comment _feed_reaction" type="button" onClick={() => handleToggleComments(post.id)}>
                <span className="_feed_inner_timeline_reaction_link">Comment</span>
              </button>
            </div>

            <div className="_padd_r24 _padd_l24 _mar_t8">
              <small>Liked by: {likedByText(post.likedBy)}</small>
            </div>

            {expandedPosts[post.id] ? (
              <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24 _mar_t16">
                <div className="_feed_inner_comment_box _mar_b16">
                  <div className="_feed_inner_comment_box_content">
                    <div className="_feed_inner_comment_box_content_image">
                      <img src="/buddy-script/assets/images/comment_img.png" alt="Image" className="_comment_img" />
                    </div>
                    <div className="_feed_inner_comment_box_content_txt">
                      <textarea
                        className="form-control _comment_textarea"
                        placeholder="Write a comment"
                        value={commentInputs[post.id] ?? ""}
                        onChange={(event) => setCommentInputs((prev) => ({ ...prev, [post.id]: event.target.value }))}
                      />
                      <button
                        type="button"
                        className="_feed_inner_text_area_btn_link _mar_t8"
                        disabled={!!actionBusy[`comment:${post.id}`]}
                        onClick={() => handleAddComment(post.id)}
                      >
                        {actionBusy[`comment:${post.id}`] ? "Adding..." : "Add Comment"}
                      </button>
                    </div>
                  </div>
                </div>

                {(post.comments ?? []).map((comment: ApiComment) => (
                  <div className="_comment_main _mar_b16" key={comment.id}>
                    <div className="_comment_area" style={{ width: "100%" }}>
                      <div className="_comment_details">
                        <h4 className="_comment_details_title">{toName(comment.author)}</h4>
                        <p className="_comment_details_para">{comment.content}</p>
                        <p className="text-xs">{formatRelative(comment.createdAt)}</p>
                      </div>
                      <div className="_comment_reacts _mar_t8">
                        <button
                          type="button"
                          className="_feed_inner_text_area_btn_link"
                          disabled={!!actionBusy[`like:COMMENT:${comment.id}`]}
                          onClick={() => handleToggleLike("COMMENT", comment.id, post.id)}
                        >
                          {comment.viewerLiked ? "Unlike" : "Like"} ({comment.likeCount})
                        </button>
                        <small className="_mar_l8">Liked by: {likedByText(comment.likedBy)}</small>
                      </div>

                      <div className="_mar_t8">
                        <textarea
                          className="form-control _comment_textarea"
                          placeholder="Write a reply"
                          value={replyInputs[`${post.id}:${comment.id}`] ?? ""}
                          onChange={(event) =>
                            setReplyInputs((prev) => ({
                              ...prev,
                              [`${post.id}:${comment.id}`]: event.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="_feed_inner_text_area_btn_link _mar_t8"
                          disabled={!!actionBusy[`reply:${post.id}:${comment.id}`]}
                          onClick={() => handleAddReply(post.id, comment.id)}
                        >
                          {actionBusy[`reply:${post.id}:${comment.id}`] ? "Adding..." : "Add Reply"}
                        </button>
                      </div>

                      {comment.replies.map((reply) => (
                        <div className="_mar_t8 _mar_l16" key={reply.id}>
                          <p>
                            <strong>{toName(reply.author)}</strong>: {reply.content}
                          </p>
                          <p className="text-xs">{formatRelative(reply.createdAt)}</p>
                          <button
                            type="button"
                            className="_feed_inner_text_area_btn_link"
                            disabled={!!actionBusy[`like:REPLY:${reply.id}`]}
                            onClick={() => handleToggleLike("REPLY", reply.id, post.id)}
                          >
                            {reply.viewerLiked ? "Unlike" : "Like"} ({reply.likeCount})
                          </button>
                          <small className="_mar_l8">Liked by: {likedByText(reply.likedBy)}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {!feedLoading && totalPosts === 0 ? <p>No posts yet.</p> : null}

        {hasMore ? (
          <div className="_mar_t16 _mar_b24">
            <button
              type="button"
              className="_feed_inner_text_area_btn_link"
              disabled={!!actionBusy.loadMore}
              onClick={async () => {
                setBusy("loadMore", true);
                try {
                  await loadFeed(nextCursor);
                } catch {
                  setFeedError("Unable to load more posts right now.");
                } finally {
                  setBusy("loadMore", false);
                }
              }}
            >
              {actionBusy.loadMore ? "Loading..." : "Load More"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
