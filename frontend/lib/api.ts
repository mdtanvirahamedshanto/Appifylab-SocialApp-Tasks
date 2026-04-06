import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./session";
import type { ApiComment, ApiPost, ApiReply, ApiUser, FeedResponse, LikeType, PostCommentsResponse, PostVisibility } from "./types";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "/_/backend/api" : "http://localhost:4000/api");

export const authClient = axios.create({
  baseURL,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  try {
    const response = await authClient.post<{ accessToken: string; user: unknown }>("/auth/refresh");
    const token = response.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    clearAccessToken();
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken();
    const token = await refreshPromise.finally(() => {
      refreshPromise = null;
    });

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiClient(originalRequest);
  },
);

export const api = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await authClient.post("/auth/login", payload);
    setAccessToken(data.accessToken as string);
    return data as { accessToken: string; user: { id: string; firstName: string; lastName: string; email: string } };
  },
  register: async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    const { data } = await authClient.post("/auth/register", payload);
    setAccessToken(data.accessToken as string);
    return data as { accessToken: string; user: { id: string; firstName: string; lastName: string; email: string } };
  },
  refresh: async () => {
    const { data } = await authClient.post("/auth/refresh");
    setAccessToken(data.accessToken as string);
    return data as { accessToken: string; user: { id: string; firstName: string; lastName: string; email: string } };
  },
  logout: async () => {
    await authClient.post("/auth/logout");
    clearAccessToken();
  },
  getFeed: async (cursor?: string | null, limit = 20) => {
    const { data } = await apiClient.get<FeedResponse & { success: boolean }>("/feed", {
      params: {
        cursor: cursor ?? undefined,
        limit,
      },
    });

    return {
      items: data.items,
      nextCursor: data.nextCursor,
      hasMore: data.hasMore,
    };
  },
  getPost: async (postId: string) => {
    const { data } = await apiClient.get<{ success: boolean; post: ApiPost }>(`/feed/posts/${postId}`);
    return data.post;
  },
  getPostComments: async (postId: string, cursor?: string | null, limit = 20, repliesLimit = 5) => {
    const { data } = await apiClient.get<PostCommentsResponse & { success: boolean }>(`/feed/posts/${postId}/comments`, {
      params: {
        cursor: cursor ?? undefined,
        limit,
        repliesLimit,
      },
    });

    return {
      items: data.items,
      nextCursor: data.nextCursor,
      hasMore: data.hasMore,
      totalCount: data.totalCount,
    };
  },
  createPost: async (payload: { content: string; imageUrl?: string | null; visibility: PostVisibility }) => {
    const { data } = await apiClient.post<{ success: boolean; post: ApiPost }>("/feed/posts", payload);
    return data.post;
  },
  addComment: async (postId: string, content: string) => {
    const { data } = await apiClient.post<{ success: boolean; comment: ApiComment }>(`/feed/posts/${postId}/comments`, { content });
    return data.comment;
  },
  addReply: async (commentId: string, content: string) => {
    const { data } = await apiClient.post<{ success: boolean; reply: ApiReply }>(`/feed/comments/${commentId}/replies`, { content });
    return data.reply;
  },
  toggleLike: async (type: LikeType, targetId: string) => {
    const { data } = await apiClient.post<{ success: boolean; liked: boolean; likeCount: number; likedBy: ApiUser[]; viewerLiked: boolean }>(
      "/feed/likes/toggle",
      { type, targetId },
    );

    return data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{ success: boolean; imageUrl: string; publicId: string }>("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
};
