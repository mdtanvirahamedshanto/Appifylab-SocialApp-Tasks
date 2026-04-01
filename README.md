## Appifylab Social App

Full-stack social feed application built from the provided login, registration, and feed UI mockups.

### Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, React Query, React Hook Form, Zod
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma 7
- Authentication: JWT access token + refresh token cookie
- Image Upload: Cloudinary

### Project Structure

- `backend/` - Express API, Prisma schema, auth, feed, comments, likes, and uploads
- `frontend/` - Next.js app with login, register, and protected feed routes
- `Selection Task for Full Stack Engineer at Appifylab/` - original HTML/CSS reference design and assets

### Local Setup

1. Copy environment files:

	- `backend/.env.example` to `backend/.env`
	- `frontend/.env.example` to `frontend/.env.local`

2. Start PostgreSQL and set `DATABASE_URL` in `backend/.env`.
3. Configure Cloudinary credentials in `backend/.env`.
4. Install dependencies in both packages if needed.
5. Generate Prisma client and run migrations from `backend/`.
6. Start the backend on port `4000`.
7. Start the frontend on port `3000`.

### Backend Commands

- `pnpm dev` - start the API in watch mode
- `pnpm build` - compile TypeScript
- `pnpm prisma:generate` - generate Prisma client
- `pnpm prisma:migrate` - create/apply migrations

### Frontend Commands

- `pnpm dev` - start the Next.js app
- `pnpm build` - build for production
- `pnpm lint` - run ESLint

### Notes

- The frontend expects the backend at `NEXT_PUBLIC_API_BASE_URL`.
- The feed supports protected access, newest-first pagination, comments, replies, likes, and private posts.
- Image uploads are sent to the backend and stored through Cloudinary before post creation.
