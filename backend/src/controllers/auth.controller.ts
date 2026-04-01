import type { Request, Response } from "express";
import { z } from "zod";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getClearRefreshCookieOptions, getRefreshCookieOptions, refreshCookieName } from "../utils/cookies.js";
import { login, logout, refresh, register, getCurrentUser } from "../services/auth.service.js";

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const getRegisterRateLimiter = () => authRateLimiter;

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body);
  const result = await register({
    ...parsed,
    userAgent: req.get("user-agent") ?? undefined,
    ipAddress: req.ip,
  });

  res.cookie(refreshCookieName, result.tokens.refreshToken, getRefreshCookieOptions(result.tokens.refreshTokenExpiresAt));
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);
  const result = await login({
    ...parsed,
    userAgent: req.get("user-agent") ?? undefined,
    ipAddress: req.ip,
  });

  res.cookie(refreshCookieName, result.tokens.refreshToken, getRefreshCookieOptions(result.tokens.refreshTokenExpiresAt));
  res.status(200).json({
    success: true,
    message: "Login successful",
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[refreshCookieName] as string | undefined;
  const result = await refresh(token ?? "");

  res.cookie(refreshCookieName, result.tokens.refreshToken, getRefreshCookieOptions(result.tokens.refreshTokenExpiresAt));
  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  await logout(req.cookies?.[refreshCookieName] as string | undefined);
  res.clearCookie(refreshCookieName, getClearRefreshCookieOptions());
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const user = await getCurrentUser(req.authUser.id);

  res.status(200).json({
    success: true,
    user,
  });
});
