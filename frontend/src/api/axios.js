import axios from "axios";

const api = axios.create({
  // "/api" is passed on to the backend by the Vite server (see vite.config.js),
  // which is what lets phones on the same Wi-Fi use the site too.
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// An expired or invalid login: tell the app so it can log the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

/** A readable message for any failed request. */
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request && !error.response) {
    return "Can't reach the server. Is the backend running?";
  }
  return fallback;
};

export default api;
