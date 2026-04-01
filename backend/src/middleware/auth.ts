import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError(401, "Unauthorized"));
    return;
  }

  try {
    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
};
