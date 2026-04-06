import { memo } from "react";
import type { ApiComment, ApiPost, LikeType } from "../../lib/types";
import { formatRelative, isTempEntityId, likedByText, toName } from "./feed-utils";

interface FeedPostCardProps {
  post: ApiPost;
  expanded: boolean;
  showAllComments: boolean;
  commentInput: string;
  replyInputs: Record<string, string>;
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
  onPrepareReply: (postId: string, commentId: string) => void;
}

function FeedPostCard({
  post,
  expanded,
  showAllComments,
  commentInput,
  replyInputs,
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
  onPrepareReply,
}: FeedPostCardProps) {
  const allComments = post.comments ?? [];
  const visibleComments = showAllComments ? allComments : allComments.slice(0, 2);
  const hiddenCount = Math.max(0, allComments.length - visibleComments.length);

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16" key={post.id}>
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
        <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24 _mar_t16">
          <div className="_feed_inner_comment_box _mar_b16">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="/buddy-script/assets/images/comment_img.png" alt="Image" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <input
                  className="form-control _comment_textarea"
                  placeholder="Write a comment"
                  value={commentInput}
                  onChange={(event) => onCommentInputChange(post.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void onAddComment(post.id);
                    }
                  }}
                />
                <button
                  type="button"
                  className="_feed_inner_text_area_btn_link _mar_t8"
                  disabled={!!actionBusy[`comment:${post.id}`]}
                  onClick={() => {
                    void onAddComment(post.id);
                  }}
                  aria-label="Add comment"
                >
                  {actionBusy[`comment:${post.id}`] ? "Adding..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {hiddenCount > 0 ? (
            <div className="_previous_comment _mar_b12">
              <button type="button" className="_previous_comment_txt" onClick={() => onShowAllComments(post.id)}>
                View {hiddenCount} previous comments
              </button>
            </div>
          ) : null}

          {visibleComments.map((comment: ApiComment) => (
            <div className="_comment_main _mar_b16" key={comment.id}>
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

              <div className="_comment_area" style={{ width: "100%" }}>
                <div className="_comment_details">
                  <h4 className="_comment_details_title">{toName(comment.author)}</h4>
                  <p className="_comment_details_para">{comment.content}</p>
                </div>

                <div className="_comment_reacts _mar_t8">
                  <button
                    type="button"
                    className="_feed_inner_text_area_btn_link"
                    disabled={!!actionBusy[`like:COMMENT:${comment.id}`] || isTempEntityId(comment.id)}
                    onClick={() => onToggleLike("COMMENT", comment.id, post.id)}
                  >
                    {comment.viewerLiked ? "Unlike" : "Like"} ({comment.likeCount})
                  </button>
                  <button
                    type="button"
                    className="_feed_inner_text_area_btn_link _mar_l8"
                    onClick={() => {
                      void onSharePost(post.id, comment.content);
                    }}
                    disabled={!!actionBusy[`share:${post.id}`]}
                  >
                    Share
                  </button>
                  <button type="button" className="_feed_inner_text_area_btn_link _mar_l8" onClick={() => onPrepareReply(post.id, comment.id)}>
                    Reply
                  </button>
                  <span className="_mar_l8 text-xs">{formatRelative(comment.createdAt)}</span>
                  <small className="_mar_l8">Liked by: {likedByText(comment.likedBy)}</small>
                </div>

                <div className="_mar_t8">
                  <input
                    className="form-control _comment_textarea"
                    placeholder="Write a reply"
                    value={replyInputs[`${post.id}:${comment.id}`] ?? ""}
                    onChange={(event) => onReplyInputChange(post.id, comment.id, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void onAddReply(post.id, comment.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="_feed_inner_text_area_btn_link _mar_t8"
                    disabled={!!actionBusy[`reply:${post.id}:${comment.id}`] || isTempEntityId(comment.id)}
                    onClick={() => {
                      void onAddReply(post.id, comment.id);
                    }}
                  >
                    {actionBusy[`reply:${post.id}:${comment.id}`] ? "Adding..." : "Reply"}
                  </button>
                </div>

                {comment.replies.map((reply) => (
                  <div className="_mar_t8 _mar_l16" key={reply.id}>
                    {isTempEntityId(reply.id) ? (
                      <div className="_mar_b4">
                        <small className="text-xs opacity-70">Syncing reply...</small>
                      </div>
                    ) : null}
                    <p>
                      <strong>{toName(reply.author)}</strong>: {reply.content}
                    </p>
                    <p className="text-xs">{formatRelative(reply.createdAt)}</p>
                    <button
                      type="button"
                      className="_feed_inner_text_area_btn_link"
                      disabled={!!actionBusy[`like:REPLY:${reply.id}`] || isTempEntityId(reply.id)}
                      onClick={() => onToggleLike("REPLY", reply.id, post.id)}
                    >
                      {reply.viewerLiked ? "Unlike" : "Like"} ({reply.likeCount})
                    </button>
                    <button
                      type="button"
                      className="_feed_inner_text_area_btn_link _mar_l8"
                      onClick={() => {
                        void onSharePost(post.id, reply.content);
                      }}
                      disabled={!!actionBusy[`share:${post.id}`] || isTempEntityId(reply.id)}
                    >
                      Share
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
  );
}

const getRelevantActionBusyKeys = (post: ApiPost) => {
  const keys = [
    `like:POST:${post.id}`,
    `share:${post.id}`,
    `comment:${post.id}`,
    `comments:${post.id}`,
  ];

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
    if (!!prev[key] !== !!next[key]) {
      return false;
    }
  }

  return true;
};

const equalReplyInputsForPost = (prev: Record<string, string>, next: Record<string, string>, postId: string) => {
  const prefix = `${postId}:`;
  const prevKeys = Object.keys(prev).filter((key) => key.startsWith(prefix));
  const nextKeys = Object.keys(next).filter((key) => key.startsWith(prefix));

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prev[key] !== next[key]) {
      return false;
    }
  }

  return true;
};

export default memo(FeedPostCard, (prev, next) => {
  if (prev.post !== next.post) return false;
  if (prev.expanded !== next.expanded) return false;
  if (prev.showAllComments !== next.showAllComments) return false;
  if (prev.commentInput !== next.commentInput) return false;
  if (prev.shareCount !== next.shareCount) return false;
  if (prev.shareStatus !== next.shareStatus) return false;

  const busyKeys = getRelevantActionBusyKeys(next.post);
  if (!equalPostScopedMap(prev.actionBusy, next.actionBusy, busyKeys)) return false;
  if (!equalReplyInputsForPost(prev.replyInputs, next.replyInputs, next.post.id)) return false;

  return true;
});
