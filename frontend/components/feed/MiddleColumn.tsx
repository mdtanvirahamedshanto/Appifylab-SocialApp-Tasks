"use client";

import { useEffect, useState } from "react";
import type { ApiPost, LikeType, PostVisibility } from "../../lib/types";
import { api } from "../../lib/api";

const toName = (user: { firstName: string; lastName: string }) => `${user.firstName} ${user.lastName}`.trim();

const likedByText = (users: Array<{ firstName: string; lastName: string }>) => {
  if (!users.length) {
    return "No likes yet";
  }

  return users.map(toName).join(", ");
};

const formatDate = (input: string) => {
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
};

export default function MiddleColumn() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [composerContent, setComposerContent] = useState("");
  const [composerVisibility, setComposerVisibility] = useState<PostVisibility>("PUBLIC");
  const [composerFile, setComposerFile] = useState<File | null>(null);
  const [composerBusy, setComposerBusy] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const loadFeed = async (cursor?: string | null) => {
    const result = await api.getFeed(cursor ?? null, 20);

    setPosts((prev) => (cursor ? [...prev, ...result.items] : result.items));
    setNextCursor(result.nextCursor);
    setHasMore(result.hasMore);
  };

  useEffect(() => {
    let mounted = true;

    setLoadingFeed(true);
    setFeedError(null);

    loadFeed()
      .catch(() => {
        if (!mounted) return;
        setFeedError("Unable to load feed right now.");
      })
      .finally(() => {
        if (mounted) {
          setLoadingFeed(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const ensurePostDetails = async (postId: string) => {
    const existing = posts.find((post) => post.id === postId);

    if (existing?.comments) {
      return;
    }

    const detailed = await api.getPost(postId);
    setPosts((prev) => prev.map((post) => (post.id === postId ? detailed : post)));
  };

  const updatePost = (postId: string, updater: (post: ApiPost) => ApiPost) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? updater(post) : post)));
  };

  const toggleLike = async (type: LikeType, targetId: string, postId: string) => {
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
  };

  const handleCreatePost = async () => {
    if (!composerContent.trim() && !composerFile) {
      setComposerError("Add post text or an image.");
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
      setComposerFile(null);
      setComposerVisibility("PUBLIC");
    } catch {
      setComposerError("Unable to publish post right now.");
    } finally {
      setComposerBusy(false);
    }
  };

  const handleToggleComments = async (postId: string) => {
    const next = !expandedPosts[postId];
    setExpandedPosts((prev) => ({ ...prev, [postId]: next }));

    if (next) {
      await ensurePostDetails(postId);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = (commentInputs[postId] ?? "").trim();
    if (!content) return;

    await ensurePostDetails(postId);
    const created = await api.addComment(postId, content);

    updatePost(postId, (post) => ({
      ...post,
      commentCount: post.commentCount + 1,
      comments: [created, ...(post.comments ?? [])],
    }));

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleAddReply = async (postId: string, commentId: string) => {
    const key = `${postId}:${commentId}`;
    const content = (replyInputs[key] ?? "").trim();
    if (!content) return;

    await ensurePostDetails(postId);
    const created = await api.addReply(commentId, content);

    updatePost(postId, (post) => ({
      ...post,
      comments: (post.comments ?? []).map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replyCount: comment.replyCount + 1,
              replies: [...comment.replies, created],
            }
          : comment,
      ),
    }));

    setReplyInputs((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
          <div className="_feed_inner_text_area_box">
            <div className="_feed_inner_text_area_box_image">
              <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_txt_img" />
            </div>
            <div className="form-floating _feed_inner_text_area_box_form">
              <textarea
                className="form-control _textarea"
                placeholder="Write something"
                id="postComposer"
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
              <div className="_feed_common">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setComposerFile(event.target.files?.[0] ?? null)}
                  className="_feed_inner_text_area_bottom_photo_link"
                />
              </div>
              <div className="_feed_common">
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
                {composerBusy ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
          {composerError ? <p className="_mar_t16 text-sm text-rose-500">{composerError}</p> : null}
        </div>

        {loadingFeed ? <p>Loading feed...</p> : null}
        {feedError ? <p className="text-sm text-rose-500">{feedError}</p> : null}

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
                      {formatDate(post.createdAt)} . <span>{post.visibility}</span>
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

            <div className="_feed_inner_timeline_reaction">
              <button
                className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.viewerLiked ? "_feed_reaction_active" : ""}`}
                type="button"
                onClick={() => toggleLike("POST", post.id, post.id)}
              >
                <span className="_feed_inner_timeline_reaction_link">{post.viewerLiked ? "Unlike" : "Like"} ({post.likeCount})</span>
              </button>
              <button className="_feed_inner_timeline_reaction_comment _feed_reaction" type="button" onClick={() => handleToggleComments(post.id)}>
                <span className="_feed_inner_timeline_reaction_link">Comments ({post.commentCount})</span>
              </button>
            </div>
            <div className="_padd_r24 _padd_l24 _mar_t16">
              <small>Liked by: {likedByText(post.likedBy)}</small>
            </div>

            {expandedPosts[post.id] ? (
              <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24">
                <div className="_feed_inner_comment_box _mar_b16">
                  <div className="_feed_inner_comment_box_content">
                    <div className="_feed_inner_comment_box_content_txt">
                      <textarea
                        className="form-control _comment_textarea"
                        placeholder="Write a comment"
                        value={commentInputs[post.id] ?? ""}
                        onChange={(event) => setCommentInputs((prev) => ({ ...prev, [post.id]: event.target.value }))}
                      />
                      <button type="button" className="_feed_inner_text_area_btn_link _mar_t16" onClick={() => handleAddComment(post.id)}>
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>

                {(post.comments ?? []).map((comment) => (
                  <div key={comment.id} className="_mar_b24">
                    <p>
                      <strong>{toName(comment.author)}</strong>: {comment.content}
                    </p>
                    <p className="text-xs">{formatDate(comment.createdAt)}</p>
                    <div className="_mar_t8">
                      <button type="button" className="_feed_inner_text_area_btn_link" onClick={() => toggleLike("COMMENT", comment.id, post.id)}>
                        {comment.viewerLiked ? "Unlike" : "Like"} ({comment.likeCount})
                      </button>
                    </div>
                    <small>Liked by: {likedByText(comment.likedBy)}</small>

                    <div className="_mar_t16">
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
                      <button type="button" className="_feed_inner_text_area_btn_link _mar_t16" onClick={() => handleAddReply(post.id, comment.id)}>
                        Add Reply
                      </button>
                    </div>

                    <div className="_mar_t16 _mar_l16">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="_mar_b16">
                          <p>
                            <strong>{toName(reply.author)}</strong>: {reply.content}
                          </p>
                          <p className="text-xs">{formatDate(reply.createdAt)}</p>
                          <button type="button" className="_feed_inner_text_area_btn_link" onClick={() => toggleLike("REPLY", reply.id, post.id)}>
                            {reply.viewerLiked ? "Unlike" : "Like"} ({reply.likeCount})
                          </button>
                          <br />
                          <small>Liked by: {likedByText(reply.likedBy)}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {hasMore ? (
          <div className="_mar_t24 _mar_b24">
            <button type="button" className="_feed_inner_text_area_btn_link" onClick={() => loadFeed(nextCursor)}>
              Load More
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
