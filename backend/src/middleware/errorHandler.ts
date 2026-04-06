import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: error.flatten(),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "Duplicate record." });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    if (error.code === "P2028") {
      return res.status(503).json({
        success: false,
        message: "Database is busy right now. Please try again in a moment.",
      });
    }
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return res.status(500).json({
    success: false,
    message: message || "Internal server error",
  });
};
