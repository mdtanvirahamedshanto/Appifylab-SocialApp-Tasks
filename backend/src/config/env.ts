import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),
  CLOUDINARY_FOLDER: z.string().default("appifylab"),
  MAX_AUTH_REQUESTS_PER_WINDOW: z.coerce.number().int().positive().default(10),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
});

export const env = envSchema.parse(process.env);
