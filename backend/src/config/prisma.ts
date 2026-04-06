import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const datasourceUrl = process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

const adapter = new PrismaPg({ connectionString: datasourceUrl });

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: 15_000,
      timeout: 12_000,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
