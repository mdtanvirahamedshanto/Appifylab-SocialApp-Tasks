import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError.js";

type ValidateSource = "body" | "query" | "params";

export const validate = (schema: ZodTypeAny, source: ValidateSource = "body"): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(new AppError(400, "Validation failed", result.error.flatten()));
      return;
    }

    req[source] = result.data;
    next();
  };
};
