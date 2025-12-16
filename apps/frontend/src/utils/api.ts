// API utility functions
// Use relative URL to leverage Vite proxy configuration
// Proxy is configured in vite.config.ts to forward /api to http://localhost:4000
const API_URL = "/api";

// Helper to get token from auth store
// Read directly from localStorage (Zustand persist middleware syncs state to localStorage)
// This avoids circular dependencies and works in all contexts
const getToken = (): string | undefined => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (token && typeof token === "string" && token.trim() !== "") {
        return token;
      }
    }
  } catch (e) {
    console.warn("Failed to get token from storage:", e);
  }
  return undefined;
};

export const api = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {"Content-Type": "application/json"};
    const authToken = token || getToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    } else {
      console.warn(`[API] No token available for request to ${endpoint}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear invalid token from localStorage
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              // Clear the token
              parsed.state.token = "";
              parsed.state.user = null;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
              // Redirect to login if we're not already there
              if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
              }
            }
          }
        } catch (e) {
          console.warn("Failed to clear invalid token:", e);
        }
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      } else {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text();
    }
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {"Content-Type": "application/json"};
    const authToken = token || getToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear invalid token from localStorage
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              parsed.state.token = "";
              parsed.state.user = null;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
              if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
              }
            }
          }
        } catch (e) {
          console.warn("Failed to clear invalid token:", e);
        }
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      } else {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text();
    }
  },

  put: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {"Content-Type": "application/json"};
    const authToken = token || getToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              parsed.state.token = "";
              parsed.state.user = null;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
              if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
              }
            }
          }
        } catch (e) {
          console.warn("Failed to clear invalid token:", e);
        }
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      } else {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text();
    }
  },

  delete: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {"Content-Type": "application/json"};
    const authToken = token || getToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              parsed.state.token = "";
              parsed.state.user = null;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
              if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
              }
            }
          }
        } catch (e) {
          console.warn("Failed to clear invalid token:", e);
        }
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      } else {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text();
    }
  },

  upload: async (endpoint: string, formData: FormData, token?: string) => {
    const headers: HeadersInit = {};
    const authToken = token || getToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              parsed.state.token = "";
              parsed.state.user = null;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
              if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
              }
            }
          }
        } catch (e) {
          console.warn("Failed to clear invalid token:", e);
        }
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      } else {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text();
    }
  },
};

