// API utility functions
const API_URL = "http://localhost:3000/api";

export const api = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {"Content-Type": "application/json"};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
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
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
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
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
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
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
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
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
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

