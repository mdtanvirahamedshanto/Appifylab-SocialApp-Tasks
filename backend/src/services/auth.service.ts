import type { User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { compareValue, hashValue } from "../utils/hash.js";
import { getRefreshTokenExpiryMs, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

type PublicUser = Pick<User, "id" | "firstName" | "lastName" | "email" | "createdAt" | "updatedAt">;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

const buildTokens = (user: PublicUser, sessionId: string): AuthTokens => {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const refreshToken = signRefreshToken({ sessionId, userId: user.id });
  const refreshTokenExpiresAt = new Date(Date.now() + getRefreshTokenExpiryMs());

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
  };
};

const createSession = async (user: PublicUser, meta: { userAgent?: string; ipAddress?: string }) => {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "pending",
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt: new Date(Date.now() + getRefreshTokenExpiryMs()),
    },
  });

  const tokens = buildTokens(user, session.id);
  const refreshTokenHash = await hashValue(tokens.refreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash },
  });

  return tokens;
};

const publicUserFromDb = (user: User): PublicUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await hashValue(input.password);

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  const tokens = await createSession(publicUserFromDb(user), {
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });

  return { user: publicUserFromDb(user), tokens };
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await compareValue(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const tokens = await createSession(publicUserFromDb(user), {
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });

  return { user: publicUserFromDb(user), tokens };
};

export const refresh = async (refreshToken: string): Promise<AuthResult> => {
  const payload = verifyRefreshToken(refreshToken);

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
    throw new AppError(401, "Refresh session is invalid or expired");
  }

  const matches = await compareValue(refreshToken, session.refreshTokenHash);

  if (!matches) {
    throw new AppError(401, "Refresh token mismatch");
  }

  const tokens = buildTokens(session.user, session.id);
  const refreshTokenHash = await hashValue(tokens.refreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    },
  });

  return { user: session.user, tokens };
};

export const logout = async (refreshToken: string | undefined) => {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.session.update({
      where: { id: payload.sessionId },
      data: { revokedAt: new Date() },
    });
  } catch {
    return;
  }
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};
