import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://rengy-backend-nrla.onrender.com/api",
  withCredentials: true,
});

let refreshRequest: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      refreshRequest =
        refreshRequest || api.post("/auth/refresh-token").finally(() => {
          refreshRequest = null;
        });

      await refreshRequest;
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
