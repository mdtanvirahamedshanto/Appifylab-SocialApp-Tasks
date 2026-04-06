import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      authUser?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
      sessionId?: string;
      prismaUser?: User;
      file?: Express.Multer.File;
    }
  }
}

export {};
