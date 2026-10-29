import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    // "Content-Type" intentionally omitted — FormData needs the browser
    // to set its own multipart boundary.
  },
});

// Centralizes session-expiry handling so individual components don't each
// need their own 401 branch — a stale/invalid token means nothing else on
// the page will work either, so this is a hard logout. 403s are left to
// each component (most already catch and toast error.response.data.message
// for a specific action) since a single restricted action shouldn't
// navigate the user away from the page they're on; PermissionRoute already
// handles the route-level 403 case.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("original_auth_token");
      localStorage.removeItem("impersonate");
      delete api.defaults.headers.common["Authorization"];

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
