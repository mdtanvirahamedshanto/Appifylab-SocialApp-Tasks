import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const assignRequestId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id")?.trim();
  const requestId = incoming && incoming.length > 0 ? incoming.slice(0, 100) : randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
};
