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
