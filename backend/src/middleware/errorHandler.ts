import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

type ErrorCode =
  | "APP_ERROR"
  | "VALIDATION_ERROR"
  | "DUPLICATE_RECORD"
  | "NOT_FOUND"
  | "DB_TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

const buildErrorResponse = (params: {
  requestId: string;
  code: ErrorCode;
  message: string;
  details?: unknown;
}) => ({
  success: false,
  message: params.message,
  requestId: params.requestId,
  error: {
    code: params.code,
    message: params.message,
    requestId: params.requestId,
    ...(params.details !== undefined ? { details: params.details } : {}),
  },
});

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = req.requestId ?? "unknown";
  const isProduction = env.NODE_ENV === "production";

  if (error instanceof AppError) {
    const safeMessage = isProduction && error.statusCode >= 500 ? "Internal server error" : error.message;
    const safeDetails = isProduction && error.statusCode >= 500 ? undefined : error.details;

    if (error.statusCode >= 500) {
      logger.error("Unhandled AppError", {
        requestId,
        statusCode: error.statusCode,
        message: error.message,
      });
    }

    return res.status(error.statusCode).json(
      buildErrorResponse({
        requestId,
        code: "APP_ERROR",
        message: safeMessage,
        details: safeDetails,
      }),
    );
  }

  if (error instanceof ZodError) {
    return res.status(400).json(
      buildErrorResponse({
        requestId,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.flatten(),
      }),
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json(
        buildErrorResponse({
          requestId,
          code: "DUPLICATE_RECORD",
          message: "Duplicate record.",
        }),
      );
    }

    if (error.code === "P2025") {
      return res.status(404).json(
        buildErrorResponse({
          requestId,
          code: "NOT_FOUND",
          message: "Record not found.",
        }),
      );
    }

    if (error.code === "P2028") {
      return res.status(503).json(
        buildErrorResponse({
          requestId,
          code: "DB_TIMEOUT",
          message: "Database is busy right now. Please try again in a moment.",
        }),
      );
    }
  }

  logger.error("Unhandled unexpected error", {
    requestId,
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
  });

  const message = !isProduction && error instanceof Error ? error.message : "Internal server error";
  return res.status(500).json(
    buildErrorResponse({
      requestId,
      code: "INTERNAL_SERVER_ERROR",
      message,
    }),
  );
};
