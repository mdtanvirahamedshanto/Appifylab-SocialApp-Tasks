import type { CookieOptions } from "express";
import { env } from "../config/env.js";

export const refreshCookieName = "refreshToken";

export const getRefreshCookieOptions = (expiresAt: Date): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  expires: expiresAt,
});

export const getClearRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
});
