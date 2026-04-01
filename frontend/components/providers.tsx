"use client";

import { useEffect, useMemo, useState, createContext, useContext, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "../lib/api";
import { clearAccessToken, setAccessToken } from "../lib/session";
import type { ApiUser } from "../lib/types";

interface AuthContextValue {
  user: ApiUser | null;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (user: ApiUser, accessToken: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within Providers");
  }

  return context;
};

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .refresh()
      .then((result) => {
        if (!active) return;
        setAccessToken(result.accessToken);
        setUser(result.user);
      })
      .catch(() => {
        if (!active) return;
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    login: async (payload) => {
      const result = await api.login(payload);
      setUser(result.user);
    },
    register: async (payload) => {
      const result = await api.register(payload);
      setUser(result.user);
    },
    logout: async () => {
      await api.logout();
      setUser(null);
    },
    setSession: (nextUser, accessToken) => {
      setUser(nextUser);
      setAccessToken(accessToken);
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}
