import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
      sessionId?: string;
      prismaUser?: User;
    }
  }
}

export {};
