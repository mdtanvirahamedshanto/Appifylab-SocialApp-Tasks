## Frontend Overview

This frontend is built with Next.js App Router and TypeScript for the Appifylab social feed task.

### Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- TanStack Query
- Axios
- React Hook Form + Zod

### Routes

- `/login` - login form using the provided design style
- `/register` - registration form using the provided design style
- `/feed` - protected feed UI with post, comments, replies, likes, and private/public state

### Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### Commands

- `pnpm dev` - start development server
- `pnpm build` - build production bundle
- `pnpm start` - run production server
- `pnpm lint` - run lint checks

### Notes

- Static task assets are copied under `public/buddy-script/assets`.
- Auth uses access tokens in memory and refresh token rotation through backend cookie endpoints.
- Feed data is loaded through REST APIs and rendered with infinite scrolling.

### Feed Module Breakdown

- `components/feed/FeedClient.tsx`
	- Route entry shell for `/feed`
	- Handles auth guard + auth loading skeleton

- `components/feed/MiddleColumn.tsx`
	- UI-only orchestrator
	- Pulls all feed state/actions from `useFeedController`

- `components/feed/useFeedController.ts`
	- All async operations + optimistic updates
	- Manages feed list, composer state, pagination, likes, comments, replies, and share state

- `components/feed/FeedPostCard.tsx`
	- Renders a single post and nested comment/reply tree
	- Uses memoization with custom comparator for post-scoped rerender optimization

- `components/feed/PostComposer.tsx`
	- Controlled composer UI for creating posts
	- Memoized to avoid unnecessary rerenders

- `components/feed/StoriesSection.tsx`
	- Extracted story cards section (memoized)

- `components/feed/MiddleFeedLoadingSkeleton.tsx`
	- Dedicated feed loading skeleton (memoized)

- `components/feed/feed-utils.ts`
	- Pure helper functions (`formatRelative`, `toName`, `likedByText`, `isTempEntityId`)
