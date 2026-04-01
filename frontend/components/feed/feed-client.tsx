"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/api";
import type { ApiComment, ApiPost, ApiReply, FeedResponse } from "../../lib/types";
import { useAuth } from "../providers";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const createPostSchema = z.object({
  content: z.string().trim().min(1, "Write something first").max(5000),
  imageUrl: z.string().url().nullable().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

const commentSchema = z.object({ content: z.string().trim().min(1).max(2000) });
const replySchema = z.object({ content: z.string().trim().min(1).max(2000) });

type CreatePostValues = z.infer<typeof createPostSchema>;

const fetchFeed = async (pageParam: string | null) => {
  const { data } = await apiClient.get<FeedResponse>("/feed", {
    params: {
      cursor: pageParam ?? undefined,
      limit: 10,
    },
  });

  return data;
};

const fetchPost = async (postId: string) => {
  const { data } = await apiClient.get<{ post: ApiPost }>(`/feed/posts/${postId}`);
  return data.post;
};

export function FeedClient() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.replace("/login");
    }
  }, [auth.isLoading, auth.user, router]);

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => fetchFeed(pageParam ?? null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(auth.user),
  });

  const createPostForm = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "", imageUrl: "", visibility: "PUBLIC" },
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload: CreatePostValues) => {
      const { data } = await apiClient.post<{ post: ApiPost }>("/feed/posts", payload);
      return data.post;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      createPostForm.reset({ content: "", imageUrl: "", visibility: "PUBLIC" });
    },
  });

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
        void feedQuery.fetchNextPage();
      }
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [feedQuery]);

  const allPosts = useMemo(() => feedQuery.data?.pages.flatMap((page) => page.items) ?? [], [feedQuery.data]);

  if (auth.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading session...</div>;
  }

  if (!auth.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Buddy Script</p>
            <h1 className="text-2xl font-semibold text-slate-950">Feed</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              {auth.user.firstName} {auth.user.lastName}
            </div>
            <button
              type="button"
              onClick={async () => {
                await auth.logout();
                router.replace("/login");
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="glass-panel rounded-[28px] border border-white/60 p-5 shadow-[0_18px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Create post</p>
              <h2 className="text-xl font-semibold text-slate-950">Share with your circle</h2>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Public or private</span>
          </div>
          <form
            className="space-y-4"
            onSubmit={createPostForm.handleSubmit((values) => createPostMutation.mutate(values))}
          >
            <textarea
              rows={4}
              className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="What’s on your mind?"
              {...createPostForm.register("content")}
            />
            <div className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
              <input
                type="url"
                placeholder="Image URL (optional)"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                {...createPostForm.register("imageUrl", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
              />
              <select
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                {...createPostForm.register("visibility")}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </section>

        {feedQuery.isLoading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500">Loading posts...</div>
        ) : null}

        <section className="space-y-5">
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              expanded={expandedPostId === post.id}
              onToggle={() => setExpandedPostId((current) => (current === post.id ? null : post.id))}
              onChange={() => queryClient.invalidateQueries({ queryKey: ["feed"] })}
            />
          ))}
        </section>

        <div ref={sentinelRef} className="h-8" />
        {feedQuery.isFetchingNextPage ? <p className="text-center text-sm text-slate-500">Loading more posts...</p> : null}
        {!feedQuery.hasNextPage && allPosts.length > 0 ? <p className="text-center text-sm text-slate-400">You are all caught up.</p> : null}
      </main>
    </div>
  );
}

function PostCard({
  post,
  expanded,
  onToggle,
  onChange,
}: {
  post: ApiPost;
  expanded: boolean;
  onToggle: () => void;
  onChange: () => void;
}) {
  const commentForm = useForm<{ content: string }>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["post", post.id],
    queryFn: () => fetchPost(post.id),
    enabled: expanded,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ liked: boolean }>("/feed/likes/toggle", {
        type: "POST",
        targetId: post.id,
      });
      return data;
    },
    onSuccess: onChange,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post(`/feed/posts/${post.id}/comments`, { content });
      return data;
    },
    onSuccess: async () => {
      commentForm.reset({ content: "" });
      await detailQuery.refetch();
      onChange();
    },
  });

  return (
    <article className="glass-panel overflow-hidden rounded-[28px] border border-white/60 shadow-[0_18px_80px_rgba(15,23,42,0.08)]">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {post.author.firstName} {post.author.lastName}
            </p>
            <p className="text-xs text-slate-500">{post.author.email}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.visibility === "PUBLIC" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {post.visibility}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p>

        {post.imageUrl ? <img src={post.imageUrl} alt="Post attachment" className="mt-4 w-full rounded-[24px] object-cover" /> : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => toggleLikeMutation.mutate()}
            className={`rounded-full px-4 py-2 font-semibold transition ${post.viewerLiked ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {post.viewerLiked ? "Unlike" : "Like"} {post.likeCount}
          </button>
          <button type="button" onClick={onToggle} className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-200">
            Comments {post.commentCount}
          </button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {post.likedBy.slice(0, 4).map((user) => (
              <span key={user.id} className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                {user.firstName} {user.lastName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-200/80 bg-white/60 p-5">
          <form
            className="mb-5 flex gap-3"
            onSubmit={commentForm.handleSubmit((values) => addCommentMutation.mutate(values.content))}
          >
            <input
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Write a comment"
              {...commentForm.register("content")}
            />
            <button type="submit" className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
              Comment
            </button>
          </form>

          <div className="space-y-4">
            {(detailQuery.data?.comments ?? []).map((comment) => (
              <CommentBlock
                key={comment.id}
                postId={post.id}
                comment={comment}
                replyTargetId={replyTargetId}
                setReplyTargetId={setReplyTargetId}
                onChange={onChange}
                onRefetch={() => detailQuery.refetch()}
              />
            ))}
            {!detailQuery.data?.comments?.length ? <p className="text-sm text-slate-500">No comments yet.</p> : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function CommentBlock({
  postId,
  comment,
  replyTargetId,
  setReplyTargetId,
  onChange,
  onRefetch,
}: {
  postId: string;
  comment: ApiComment;
  replyTargetId: string | null;
  setReplyTargetId: (value: string | null) => void;
  onChange: () => void;
  onRefetch: () => Promise<unknown>;
}) {
  const replyForm = useForm<{ content: string }>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: "" },
  });

  const commentLikeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/feed/likes/toggle", { type: "COMMENT", targetId: comment.id });
    },
    onSuccess: onChange,
  });

  const addReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiClient.post(`/feed/comments/${comment.id}/replies`, { content });
    },
    onSuccess: async () => {
      replyForm.reset({ content: "" });
      setReplyTargetId(null);
      await onRefetch();
      onChange();
    },
  });

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {comment.author.firstName} {comment.author.lastName}
          </p>
          <p className="text-xs text-slate-500">{comment.author.email}</p>
        </div>
        <button type="button" onClick={() => commentLikeMutation.mutate()} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
          {comment.viewerLiked ? "Unlike" : "Like"} {comment.likeCount}
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>

      <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-indigo-600">
        <button type="button" onClick={() => setReplyTargetId(replyTargetId === comment.id ? null : comment.id)}>
          Reply
        </button>
        <span>{comment.replies.length} replies</span>
      </div>

      {replyTargetId === comment.id ? (
        <form
          className="mt-4 flex gap-3"
          onSubmit={replyForm.handleSubmit((values) => addReplyMutation.mutate(values.content))}
        >
          <input
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            placeholder="Write a reply"
            {...replyForm.register("content")}
          />
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Reply
          </button>
        </form>
      ) : null}

      {comment.replies.length ? (
        <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
          {comment.replies.map((reply) => (
            <ReplyBlock key={reply.id} reply={reply} onChange={onChange} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReplyBlock({ reply, onChange }: { reply: ApiReply; onChange: () => void }) {
  const replyLikeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/feed/likes/toggle", { type: "REPLY", targetId: reply.id });
    },
    onSuccess: onChange,
  });

  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {reply.author.firstName} {reply.author.lastName}
          </p>
          <p className="text-xs text-slate-500">{reply.author.email}</p>
        </div>
        <button type="button" onClick={() => replyLikeMutation.mutate()} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
          {reply.viewerLiked ? "Unlike" : "Like"} {reply.likeCount}
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-700">{reply.content}</p>
    </div>
  );
}
