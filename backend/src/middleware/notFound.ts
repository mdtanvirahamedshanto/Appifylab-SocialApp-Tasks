import type { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  const requestId = req.requestId ?? "unknown";
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestId,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      requestId,
    },
  });
};
