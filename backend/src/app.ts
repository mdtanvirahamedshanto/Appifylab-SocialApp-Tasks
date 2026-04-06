import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { assignRequestId } from "./middleware/requestId.js";

export const createApp = () => {
  const app = express();
  const allowedOrigins = env.FRONTEND_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(assignRequestId);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin blocked"));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
