import { env } from "../config/env.js";

type LogLevel = "INFO" | "WARN" | "ERROR";

const writeLog = (level: LogLevel, message: string, meta?: unknown) => {
  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta !== undefined ? { meta } : {}),
  };

  const line = `${JSON.stringify(payload)}\n`;

  if (level === "ERROR") {
    process.stderr.write(line);
    return;
  }

  if (env.NODE_ENV !== "test") {
    process.stdout.write(line);
  }
};

export const logger = {
  info: (message: string, meta?: unknown) => writeLog("INFO", message, meta),
  warn: (message: string, meta?: unknown) => writeLog("WARN", message, meta),
  error: (message: string, meta?: unknown) => writeLog("ERROR", message, meta),
};
