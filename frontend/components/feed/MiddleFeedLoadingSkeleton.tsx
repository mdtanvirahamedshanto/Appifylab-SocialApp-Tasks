import { memo } from "react";

function MiddleFeedLoadingSkeleton() {
  return (
    <div className="_mar_b16" aria-hidden="true">
      <div className="feed-skeleton-card">
        <div className="feed-skeleton-row">
          <div className="feed-skeleton feed-skeleton-avatar" />
          <div className="feed-skeleton-stack">
            <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-lg" />
            <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-sm" />
          </div>
        </div>
        <div className="feed-skeleton feed-skeleton-line" />
        <div className="feed-skeleton feed-skeleton-line" />
        <div className="feed-skeleton feed-skeleton-rect" />
      </div>

      <div className="feed-skeleton-card">
        <div className="feed-skeleton-row">
          <div className="feed-skeleton feed-skeleton-avatar" />
          <div className="feed-skeleton-stack">
            <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-lg" />
            <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-sm" />
          </div>
        </div>
        <div className="feed-skeleton feed-skeleton-line" />
        <div className="feed-skeleton feed-skeleton-line feed-skeleton-line-sm" />
      </div>
    </div>
  );
}

export default memo(MiddleFeedLoadingSkeleton);
