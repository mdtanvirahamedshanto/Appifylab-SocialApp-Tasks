import { memo, type KeyboardEvent } from "react";
import type { ApiComment, ApiPost, LikeType } from "../../lib/types";
import { formatRelative, isTempEntityId, likedByText, toName } from "./feed-utils";

interface FeedPostCardProps {
  post: ApiPost;
  expanded: boolean;
  commentsLoading: boolean;
  commentsHasMore: boolean;
  showAllComments: boolean;
  commentInput: string;
  replyInputs: Record<string, string>;
  openReplyBoxes: Record<string, boolean>;
  actionBusy: Record<string, boolean>;
  shareCount: number;
  shareStatus: string;
  onToggleLike: (type: LikeType, targetId: string, postId: string) => void;
  onToggleComments: (postId: string) => void | Promise<void>;
  onSharePost: (postId: string, content: string) => void | Promise<void>;
  onCommentInputChange: (postId: string, value: string) => void;
  onAddComment: (postId: string) => void | Promise<void>;
  onReplyInputChange: (postId: string, commentId: string, value: string) => void;
  onAddReply: (postId: string, commentId: string) => void | Promise<void>;
  onShowAllComments: (postId: string) => void;
  onLoadMoreComments: (postId: string) => void | Promise<void>;
  onToggleReplyBox: (postId: string, commentId: string) => void;
}

function FeedPostCard({
  post,
  expanded,
  commentsLoading,
  commentsHasMore,
  showAllComments,
  commentInput,
  replyInputs,
  openReplyBoxes,
  actionBusy,
  shareCount,
  shareStatus,
  onToggleLike,
  onToggleComments,
  onSharePost,
  onCommentInputChange,
  onAddComment,
  onReplyInputChange,
  onAddReply,
  onShowAllComments,
  onLoadMoreComments,
  onToggleReplyBox,
}: FeedPostCardProps) {
  const handleTextareaSubmitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const allComments = post.comments ?? [];
  const visibleComments = showAllComments ? allComments : allComments.slice(0, 2);
  const totalComments = post.commentCount ?? allComments.length;
  const hiddenCount = Math.max(0, totalComments - visibleComments.length);

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      {isTempEntityId(post.id) ? (
        <div className="_padd_r24 _padd_l24 _mar_b10">
          <small className="text-xs opacity-70">Syncing post...</small>
        </div>
      ) : null}

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
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>{shareCount}</span> Share
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.viewerLiked ? "_feed_reaction_active" : ""}`}
          type="button"
          disabled={!!actionBusy[`like:POST:${post.id}`] || isTempEntityId(post.id)}
          onClick={() => onToggleLike("POST", post.id, post.id)}
        >
          <span className="_feed_inner_timeline_reaction_link">{post.viewerLiked ? "Unlike" : "Like"}</span>
        </button>
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          type="button"
          disabled={isTempEntityId(post.id)}
          onClick={() => {
            void onToggleComments(post.id);
          }}
        >
          <span className="_feed_inner_timeline_reaction_link">Comment</span>
        </button>
        <button
          className="_feed_inner_timeline_reaction_share _feed_reaction"
          type="button"
          disabled={!!actionBusy[`share:${post.id}`] || isTempEntityId(post.id)}
          onClick={() => {
            void onSharePost(post.id, post.content);
          }}
        >
          <span className="_feed_inner_timeline_reaction_link">{actionBusy[`share:${post.id}`] ? "Sharing..." : "Share"}</span>
        </button>
      </div>

      {shareStatus ? (
        <div className="_padd_r24 _padd_l24 _mar_t8">
          <small className="text-xs opacity-70">{shareStatus}</small>
        </div>
      ) : null}

      <div className="_padd_r24 _padd_l24 _mar_t8">
        <small>Liked by: {likedByText(post.likedBy)}</small>
      </div>

      {expanded ? (
        <>
          <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24 _mar_t16">
            <div className="_feed_inner_comment_box">
              <form
                className="_feed_inner_comment_box_form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onAddComment(post.id);
                }}
              >
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img src="/buddy-script/assets/images/comment_img.png" alt="Image" className="_comment_img" />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a comment"
                      value={commentInput}
                      onKeyDown={handleTextareaSubmitOnEnter}
                      onChange={(event) => onCommentInputChange(post.id, event.target.value)}
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  <button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={!!actionBusy[`comment:${post.id}`]} aria-label="Add comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path fill="#000" fillOpacity=".56" d="M14.74 1.26a.75.75 0 0 0-.78-.18l-12 4.5a.75.75 0 0 0 .04 1.42l4.4 1.38 1.38 4.4a.75.75 0 0 0 1.42.04l4.5-12a.75.75 0 0 0-.18-.78l-.78.78-.01.01-4.33 8.66-1.01-3.21a.75.75 0 0 0-.48-.48L3.2 6.81l8.66-4.33.01-.01.87-.21z" />
                    </svg>
                  </button>
                  <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Comment image option">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </form>
              {actionBusy[`comment:${post.id}`] ? (
                <div className="_mar_t8" aria-live="polite">
                  <small className="text-xs opacity-70">Sending comment...</small>
                </div>
              ) : null}
            </div>
          </div>

          <div className="_timline_comment_main _padd_r24 _padd_l24">
            {commentsLoading && allComments.length === 0 ? (
              <>
                <div className="feed-skeleton-row _mar_b16">
                  <div className="feed-skeleton feed-skeleton-avatar" />
                  <div className="feed-skeleton-stack" style={{ maxWidth: "360px" }}>
                    <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-sm" />
                    <div className="feed-skeleton feed-skeleton-line" style={{ width: "88%" }} />
                    <div className="feed-skeleton feed-skeleton-line" style={{ width: "56%", marginBottom: 0 }} />
                  </div>
                </div>
                <div className="feed-skeleton-row _mar_b16">
                  <div className="feed-skeleton feed-skeleton-avatar" />
                  <div className="feed-skeleton-stack" style={{ maxWidth: "330px" }}>
                    <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-sm" />
                    <div className="feed-skeleton feed-skeleton-line" style={{ width: "74%", marginBottom: 0 }} />
                  </div>
                </div>
              </>
            ) : null}

            {hiddenCount > 0 && !showAllComments ? (
              <div className="_previous_comment">
                <button type="button" className="_previous_comment_txt" onClick={() => onShowAllComments(post.id)}>
                  View {hiddenCount} previous comments
                </button>
              </div>
            ) : null}

            {showAllComments && commentsHasMore ? (
              <div className="_previous_comment">
                <button
                  type="button"
                  className="_previous_comment_txt"
                  disabled={commentsLoading}
                  onClick={() => {
                    void onLoadMoreComments(post.id);
                  }}
                >
                  {commentsLoading ? "Loading comments..." : "Load more comments"}
                </button>
              </div>
            ) : null}

            {visibleComments.map((comment: ApiComment) => {
              const replyKey = `${post.id}:${comment.id}`;

              return (
                <div className="_comment_main" key={comment.id}>
                  {isTempEntityId(comment.id) ? (
                    <div className="_mar_b8">
                      <small className="text-xs opacity-70">Syncing comment...</small>
                    </div>
                  ) : null}

                  <div className="_comment_image">
                    <a href="#0" className="_comment_image_link">
                      <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_comment_img1" />
                    </a>
                  </div>

                  <div className="_comment_area">
                    <div className="_comment_details">
                      <div className="_comment_details_top">
                        <div className="_comment_name">
                          <a href="#0">
                            <h4 className="_comment_name_title">{toName(comment.author)}</h4>
                          </a>
                        </div>
                      </div>
                      <div className="_comment_status">
                        <p className="_comment_status_text">
                          <span>{comment.content}</span>
                        </p>
                      </div>
                      <div className="_total_reactions">
                        <div className="_total_react">
                          <span className="_reaction_like">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                          </span>
                          <span className="_reaction_heart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </span>
                        </div>
                        <span className="_total">{comment.likeCount}</span>
                      </div>
                      <div className="_comment_reply">
                        <div className="_comment_reply_num">
                          <ul className="_comment_reply_list">
                            <li>
                              <span
                                style={{ cursor: "pointer", opacity: !!actionBusy[`like:COMMENT:${comment.id}`] || isTempEntityId(comment.id) ? 0.6 : 1 }}
                                onClick={() => {
                                  if (!!actionBusy[`like:COMMENT:${comment.id}`] || isTempEntityId(comment.id)) return;
                                  onToggleLike("COMMENT", comment.id, post.id);
                                }}
                              >
                                {comment.viewerLiked ? "Unlike." : "Like."}
                              </span>
                            </li>
                            <li>
                              <span style={{ cursor: "pointer" }} onClick={() => onToggleReplyBox(post.id, comment.id)}>
                                Reply.
                              </span>
                            </li>
                            <li>
                              <span
                                style={{ cursor: "pointer", opacity: !!actionBusy[`share:${post.id}`] ? 0.6 : 1 }}
                                onClick={() => {
                                  if (!!actionBusy[`share:${post.id}`]) return;
                                  void onSharePost(post.id, comment.content);
                                }}
                              >
                                Share
                              </span>
                            </li>
                            <li>
                              <span className="_time_link">.{formatRelative(comment.createdAt)}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {openReplyBoxes[replyKey] ? (
                      <div className="_feed_inner_comment_box">
                        <form
                          className="_feed_inner_comment_box_form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void onAddReply(post.id, comment.id);
                          }}
                        >
                          <div className="_feed_inner_comment_box_content">
                            <div className="_feed_inner_comment_box_content_image">
                              <img src="/buddy-script/assets/images/comment_img.png" alt="Image" className="_comment_img" />
                            </div>
                            <div className="_feed_inner_comment_box_content_txt">
                              <textarea
                                className="form-control _comment_textarea"
                                placeholder="Write a comment"
                                value={replyInputs[replyKey] ?? ""}
                                onKeyDown={handleTextareaSubmitOnEnter}
                                onChange={(event) => onReplyInputChange(post.id, comment.id, event.target.value)}
                              />
                            </div>
                          </div>
                          <div className="_feed_inner_comment_box_icon">
                            <button
                              type="submit"
                              className="_feed_inner_comment_box_icon_btn"
                              disabled={!!actionBusy[`reply:${post.id}:${comment.id}`] || isTempEntityId(comment.id)}
                              aria-label="Add reply"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <path fill="#000" fillOpacity=".56" d="M14.74 1.26a.75.75 0 0 0-.78-.18l-12 4.5a.75.75 0 0 0 .04 1.42l4.4 1.38 1.38 4.4a.75.75 0 0 0 1.42.04l4.5-12a.75.75 0 0 0-.18-.78l-.78.78-.01.01-4.33 8.66-1.01-3.21a.75.75 0 0 0-.48-.48L3.2 6.81l8.66-4.33.01-.01.87-.21z" />
                              </svg>
                            </button>
                            <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Reply image option">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </form>
                        {actionBusy[`reply:${post.id}:${comment.id}`] ? (
                          <div className="_mar_t8" aria-live="polite">
                            <small className="text-xs opacity-70">Sending reply...</small>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {comment.replies.map((reply) => (
                      <div className="_comment_main _mar_t16 _mar_l16" key={reply.id}>
                        <div className="_comment_image">
                          <a href="#0" className="_comment_image_link">
                            <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_comment_img1" />
                          </a>
                        </div>
                        <div className="_comment_area">
                          <div className="_comment_details">
                            <div className="_comment_details_top">
                              <div className="_comment_name">
                                <a href="#0">
                                  <h4 className="_comment_name_title">{toName(reply.author)}</h4>
                                </a>
                              </div>
                            </div>
                            <div className="_comment_status">
                              <p className="_comment_status_text">
                                <span>{reply.content}</span>
                              </p>
                            </div>
                            <div className="_total_reactions">
                              <div className="_total_react">
                                <span className="_reaction_like">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                  </svg>
                                </span>
                                <span className="_reaction_heart">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                  </svg>
                                </span>
                              </div>
                              <span className="_total">{reply.likeCount}</span>
                            </div>
                            <div className="_comment_reply">
                              <div className="_comment_reply_num">
                                <ul className="_comment_reply_list">
                                  <li>
                                    <span>{reply.viewerLiked ? "Unlike." : "Like."}</span>
                                  </li>
                                  <li>
                                    <span>Reply.</span>
                                  </li>
                                  <li>
                                    <span>Share</span>
                                  </li>
                                  <li>
                                    <span className="_time_link">.{formatRelative(reply.createdAt)}</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

const getRelevantActionBusyKeys = (post: ApiPost) => {
  const keys = [`like:POST:${post.id}`, `share:${post.id}`, `comment:${post.id}`, `comments:${post.id}`];

  for (const comment of post.comments ?? []) {
    keys.push(`like:COMMENT:${comment.id}`);
    keys.push(`reply:${post.id}:${comment.id}`);

    for (const reply of comment.replies) {
      keys.push(`like:REPLY:${reply.id}`);
    }
  }

  return keys;
};

const equalPostScopedMap = (prev: Record<string, boolean>, next: Record<string, boolean>, keys: string[]) => {
  for (const key of keys) {
    if (!!prev[key] !== !!next[key]) return false;
  }

  return true;
};

const equalReplyInputsForPost = (prev: Record<string, string>, next: Record<string, string>, postId: string) => {
  const prefix = `${postId}:`;
  const prevKeys = Object.keys(prev).filter((key) => key.startsWith(prefix));
  const nextKeys = Object.keys(next).filter((key) => key.startsWith(prefix));

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    if (prev[key] !== next[key]) return false;
  }

  return true;
};

export default memo(FeedPostCard, (prev, next) => {
  if (prev.post !== next.post) return false;
  if (prev.expanded !== next.expanded) return false;
  if (prev.commentsLoading !== next.commentsLoading) return false;
  if (prev.commentsHasMore !== next.commentsHasMore) return false;
  if (prev.showAllComments !== next.showAllComments) return false;
  if (prev.commentInput !== next.commentInput) return false;
  if (prev.shareCount !== next.shareCount) return false;
  if (prev.shareStatus !== next.shareStatus) return false;

  const busyKeys = getRelevantActionBusyKeys(next.post);
  if (!equalPostScopedMap(prev.actionBusy, next.actionBusy, busyKeys)) return false;
  if (!equalReplyInputsForPost(prev.replyInputs, next.replyInputs, next.post.id)) return false;

  for (const comment of next.post.comments ?? []) {
    const key = `${next.post.id}:${comment.id}`;
    if (!!prev.openReplyBoxes[key] !== !!next.openReplyBoxes[key]) return false;
  }

  return true;
});
