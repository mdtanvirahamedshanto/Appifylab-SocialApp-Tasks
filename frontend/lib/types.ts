export type PostVisibility = "PUBLIC" | "PRIVATE";
export type LikeType = "POST" | "COMMENT" | "REPLY";

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ApiReply {
  id: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  author: ApiUser;
  viewerLiked: boolean;
  likedBy: ApiUser[];
}

export interface ApiComment {
  id: string;
  content: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  author: ApiUser;
  viewerLiked: boolean;
  likedBy: ApiUser[];
  replies: ApiReply[];
}

export interface ApiPost {
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: PostVisibility;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: ApiUser;
  viewerLiked: boolean;
  likedBy: ApiUser[];
  comments?: ApiComment[];
}

export interface FeedResponse {
  items: ApiPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: ApiUser;
  accessToken: string;
}
