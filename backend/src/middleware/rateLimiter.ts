import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.MAX_AUTH_REQUESTS_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

export const feedWriteRateLimiter = rateLimit({
  windowMs: env.FEED_WRITE_RATE_LIMIT_WINDOW_MS,
  limit: env.MAX_FEED_WRITE_REQUESTS_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many feed actions. Please slow down and try again.",
  },
});
