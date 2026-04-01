import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
}

const accessTokenExpiry = "15m";
const refreshTokenExpiry = "7d";

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload & jwt.JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload & jwt.JwtPayload;

export const getRefreshTokenExpiryMs = () => 7 * 24 * 60 * 60 * 1000;
