# Appifylab Social App

Production-style full-stack social feed application built for the Appifylab Full Stack Engineer interview task.  
The UI implementation follows the provided login, registration, and feed references while delivering a complete API-backed workflow.

## Highlights

- JWT authentication with refresh-token rotation (httpOnly cookie + in-memory access token).
- Protected feed with posts, comments, replies, likes, and public/private visibility.
- Image upload pipeline with Cloudinary integration.
- Type-safe validation using Zod on both frontend and backend layers.
- Prisma + PostgreSQL data modeling for relational social interactions.

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Axios
- React Hook Form + Zod

### Backend

- Node.js + Express 5 + TypeScript
- Prisma 7 + PostgreSQL
- JWT (access + refresh), cookie-based session handling
- Multer + Cloudinary for uploads

## Repository Structure

- `backend/`: Express API, auth/feed/upload modules, Prisma schema and seed scripts.
- `frontend/`: Next.js application with login, register, and feed pages.
- `Selection Task for Full Stack Engineer at Appifylab/`: original static HTML/CSS design reference.
- `docker-compose.yml`: containerized local stack (frontend, backend, postgres).

## Frontend Feed Architecture (Who Uses What)

This section explains which file is responsible for which part of the feed page after refactoring for production maintainability.

### High-Level Flow

1. `frontend/components/feed/FeedClient.tsx`
	- Entry for protected feed screen.
	- Handles auth gate and redirects unauthenticated users to `/login`.
	- Shows full-page skeleton while auth context is loading.
	- Composes page shell (`HeaderNav`, `MobileNav`, sidebars, `MiddleColumn`).

2. `frontend/components/feed/MiddleColumn.tsx`
	- Thin orchestration component (UI composition only).
	- Consumes `useFeedController` for all async/state/action logic.
	- Renders:
	  - `StoriesSection`
	  - `PostComposer`
	  - `MiddleFeedLoadingSkeleton` (when feed API is loading)
	  - mapped `FeedPostCard` list

3. `frontend/components/feed/useFeedController.ts`
	- Single source of truth for feed behavior.
	- Owns async API operations and complex optimistic updates:
	  - initial feed load
	  - load more (cursor-based pagination)
	  - create post + optional image upload
	  - load post details/comments on demand
	  - like/unlike for post/comment/reply
	  - add comment
	  - add reply
	  - share/link copy behavior
	- Owns UI state maps:
	  - `expandedPosts`
	  - `showAllComments`
	  - `commentInputs`
	  - `replyInputs`
	  - `actionBusy`
	  - `shareCountByPost`
	  - `shareStatusByPost`

4. `frontend/components/feed/FeedPostCard.tsx`
	- Renders one post timeline card with comments/replies/actions.
	- Receives state/actions from `useFeedController` through props.
	- Encapsulates post-level rendering and interaction markup.

5. `frontend/components/feed/PostComposer.tsx`
	- Renders the create-post UI only.
	- Controlled by props (`composerContent`, visibility, file, busy, errors).

6. `frontend/components/feed/StoriesSection.tsx`
	- Story card block separated as a static presentational component.

7. `frontend/components/feed/MiddleFeedLoadingSkeleton.tsx`
	- Skeleton UI for the feed list loading phase.

8. `frontend/components/feed/feed-utils.ts`
	- Pure utility helpers:
	  - relative date formatting
	  - display name formatting
	  - likes summary text
	  - temp-entity id detection

### Performance Strategy

- `React.memo` is applied to heavy presentational components:
  - `FeedPostCard`
  - `PostComposer`
  - `StoriesSection`
  - `MiddleFeedLoadingSkeleton`

- `FeedPostCard` has a custom memo comparator that checks post-scoped busy and reply-input keys to prevent unnecessary rerenders from unrelated list items.

- Async handlers in `useFeedController` are wrapped with `useCallback` so child props remain stable across renders.

### Loading/Skeleton Behavior

- Auth-level loading skeleton (full page): `FeedClient.tsx`
- Feed data loading skeleton (middle column): `MiddleFeedLoadingSkeleton.tsx` rendered from `MiddleColumn.tsx`
- No artificial loading delay is used; skeletons appear only during real loading states.

## API Surface

Base path: `/api`

- `/api/auth`: login, register, refresh, logout
- `/api/feed`: feed, posts, comments, replies, likes
- `/api/uploads`: media upload endpoints
- `/api/health`: health check

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 16+ (if running without Docker)

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

Required backend variables:

- `DATABASE_URL`
- `FRONTEND_URL`
- `REFRESH_COOKIE_PATH`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

Optional backend variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`
- `MAX_AUTH_REQUESTS_PER_WINDOW`
- `AUTH_RATE_LIMIT_WINDOW_MS`

Create `frontend/.env.local` manually with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

For Vercel deployment using `vercel.json` with `routePrefix` set to `/_/backend`:

- Frontend environment variable:
	- `NEXT_PUBLIC_API_BASE_URL=/_/backend/api`
- Backend environment variables:
	- `FRONTEND_URL=https://<your-vercel-domain>`
	- `REFRESH_COOKIE_PATH=/_/backend/api/auth`

If you use preview deployments or multiple domains, set `FRONTEND_URL` as comma-separated origins, for example:

```env
FRONTEND_URL=https://appifylab-social-app-tasks.vercel.app,https://appifylab-social-app-tasks-git-main-username.vercel.app
```

## Local Development (Without Docker)

1. Install backend dependencies:

```bash
cd backend
pnpm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
pnpm install
```

3. Prepare database and Prisma artifacts:

```bash
cd ../backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
```

4. Start backend:

```bash
pnpm dev
```

5. Start frontend in a second terminal:

```bash
cd ../frontend
pnpm dev
```

Application URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

## Docker Setup

Run from repository root:

```bash
docker compose up --build
```

This starts:

- `db` (PostgreSQL on `5432`)
- `backend` (API on `4000`)
- `frontend` (Web app on `3000`)

## Scripts

### Backend (`backend/package.json`)

- `pnpm dev`: start API in watch mode
- `pnpm build`: compile TypeScript
- `pnpm start`: run compiled server
- `pnpm prisma:generate`: generate Prisma client
- `pnpm prisma:migrate`: create/apply migrations
- `pnpm prisma:studio`: open Prisma Studio
- `pnpm db:seed`: seed demo data
- `pnpm test`: run backend tests

### Frontend (`frontend/package.json`)

- `pnpm dev`: start Next.js dev server
- `pnpm build`: build production bundle
- `pnpm start`: start production server
- `pnpm lint`: run ESLint

## Notes for Reviewers

- UI was implemented against the provided static design references under `Selection Task for Full Stack Engineer at Appifylab/`.
- Authentication and data operations are fully integrated with the backend (not static-only screens).
- Current setup is optimized for local evaluation and interview review.
