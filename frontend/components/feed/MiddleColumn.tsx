"use client";

import { useAuth } from "../providers";
import FeedPostCard from "./FeedPostItem";
import MiddleFeedLoadingSkeleton from "./MiddleFeedLoadingSkeleton";
import PostComposer from "./PostComposer";
import StoriesSection from "./StoriesSection";
import { useFeedController } from "./useFeedController";

export default function MiddleColumn() {
  const auth = useAuth();
  const feed = useFeedController({ user: auth.user });

  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        <StoriesSection />

        <PostComposer
          composerContent={feed.composerContent}
          composerVisibility={feed.composerVisibility}
          composerFile={feed.composerFile}
          composerBusy={feed.composerBusy}
          composerError={feed.composerError}
          onContentChange={feed.setComposerContent}
          onVisibilityChange={feed.setComposerVisibility}
          onFileChange={feed.setComposerFile}
          onCreatePost={feed.handleCreatePost}
        />

        {feed.feedError ? <p className="_mar_b16 text-sm text-rose-500">{feed.feedError}</p> : null}
        {feed.feedLoading ? <MiddleFeedLoadingSkeleton /> : null}

        {feed.posts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            expanded={!!feed.expandedPosts[post.id]}
            showAllComments={!!feed.showAllComments[post.id]}
            commentInput={feed.commentInputs[post.id] ?? ""}
            replyInputs={feed.replyInputs}
            openReplyBoxes={feed.openReplyBoxes}
            actionBusy={feed.actionBusy}
            shareCount={feed.shareCountByPost[post.id] ?? 0}
            shareStatus={feed.shareStatusByPost[post.id] ?? ""}
            onToggleLike={feed.handleToggleLike}
            onToggleComments={feed.handleToggleComments}
            onSharePost={feed.handleSharePost}
            onCommentInputChange={feed.setCommentInput}
            onAddComment={feed.handleAddComment}
            onReplyInputChange={feed.setReplyInput}
            onAddReply={feed.handleAddReply}
            onShowAllComments={feed.showAllCommentsForPost}
            onToggleReplyBox={feed.toggleReplyBox}
          />
        ))}

        {!feed.feedLoading && feed.totalPosts === 0 ? <p>No posts yet.</p> : null}

        {feed.hasMore ? (
          <div className="_mar_t16 _mar_b24">
            <button
              type="button"
              className="_feed_inner_text_area_btn_link"
              disabled={!!feed.actionBusy.loadMore}
              onClick={() => {
                void feed.handleLoadMore();
              }}
            >
              {feed.actionBusy.loadMore ? "Loading..." : "Load More"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
