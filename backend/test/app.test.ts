import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    user: {},
    session: {},
    post: {},
    comment: {},
    reply: {},
    like: {},
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

const baseEnv = {
  NODE_ENV: "test",
  PORT: "4000",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/appifylab_test",
  FRONTEND_URL: "http://localhost:3000",
  ACCESS_TOKEN_SECRET: "test_access_token_secret_that_is_long_enough",
  REFRESH_TOKEN_SECRET: "test_refresh_token_secret_that_is_long_enough",
  CLOUDINARY_CLOUD_NAME: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_API_SECRET: "",
  CLOUDINARY_FOLDER: "appifylab",
  MAX_AUTH_REQUESTS_PER_WINDOW: "10",
  AUTH_RATE_LIMIT_WINDOW_MS: "900000",
};

describe("backend app smoke tests", () => {
  beforeEach(() => {
    process.env = { ...process.env, ...baseEnv };
  });

  it("returns health ok", async () => {
    const { createApp } = await import("../src/app.js");
    const app = createApp();

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: "OK" });
  });

  it("rejects invalid login payloads", async () => {
    const { createApp } = await import("../src/app.js");
    const app = createApp();

    const response = await request(app).post("/api/auth/login").send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });
});