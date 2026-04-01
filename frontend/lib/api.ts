import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./session";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export const authClient = axios.create({
  baseURL,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  try {
    const response = await authClient.post<{ accessToken: string; user: unknown }>("/auth/refresh");
    const token = response.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    clearAccessToken();
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken();
    const token = await refreshPromise.finally(() => {
      refreshPromise = null;
    });

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiClient(originalRequest);
  },
);

export const api = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await authClient.post("/auth/login", payload);
    setAccessToken(data.accessToken as string);
    return data as { accessToken: string; user: { id: string; firstName: string; lastName: string; email: string } };
  },
  register: async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    const { data } = await authClient.post("/auth/register", payload);
    setAccessToken(data.accessToken as string);
    return data as { accessToken: string; user: { id: string; firstName: string; lastName: string; email: string } };
  },
  refresh: async () => {
    const { data } = await authClient.post("/auth/refresh");
    setAccessToken(data.accessToken as string);
    return data as { accessToken: string; user: { id: string; firstName: string; lastName: string; email: string } };
  },
  logout: async () => {
    await authClient.post("/auth/logout");
    clearAccessToken();
  },
};
