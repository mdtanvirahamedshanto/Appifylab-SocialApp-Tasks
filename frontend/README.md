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
