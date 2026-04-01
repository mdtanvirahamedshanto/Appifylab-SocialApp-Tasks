export interface CursorPaginationInput {
  cursor?: string | null;
  limit?: number | null;
}

export interface ParsedCursor {
  createdAt: Date;
  id: string;
}

export const parseCursor = (cursor?: string | null): ParsedCursor | null => {
  if (!cursor) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
    createdAt: string;
    id: string;
  };

  return {
    createdAt: new Date(decoded.createdAt),
    id: decoded.id,
  };
};

export const buildCursor = (createdAt: Date, id: string) =>
  Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString("base64url");

export const parseLimit = (value: unknown, defaultLimit = 20, maxLimit = 50) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return defaultLimit;
  }

  return Math.min(Math.max(Math.trunc(numericValue), 1), maxLimit);
};
