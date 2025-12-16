import {create} from "zustand";
import {persist} from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  emailVerified: boolean;
}

interface AuthStore {
  user: User | null;
  token: string;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    phone?: string
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const API_URL = "/api";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: "",
      login: async (email: string, password: string) => {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password}),
          });

          // Check content type before parsing
          const contentType = res.headers.get("content-type");
          let data;

          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const text = await res.text();
            throw new Error(text || "Login failed");
          }

          if (!res.ok) {
            // Handle rate limiting specifically
            if (res.status === 429) {
              throw new Error(
                "Too many login attempts. Please wait a moment and try again."
              );
            }
            throw new Error(data.error || "Login failed");
          }

          // Save to state (persist middleware will handle localStorage)
          set({user: data.user, token: data.token});
        } catch (err) {
          console.error("Login failed:", err);
          const errorMessage =
            err instanceof Error ? err.message : "Login failed";
          throw new Error(errorMessage);
        }
      },
      register: async (
        name: string,
        email: string,
        password: string,
        role: string,
        phone?: string
      ) => {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, email, password, role, phone}),
          });

          // Check content type before parsing
          const contentType = res.headers.get("content-type");
          let data;

          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const text = await res.text();
            throw new Error(text || "Registration failed");
          }

          if (!res.ok) {
            // Handle rate limiting specifically
            if (res.status === 429) {
              throw new Error(
                "Too many registration attempts. Please wait a moment and try again."
              );
            }
            throw new Error(data.error || "Registration failed");
          }

          // Save to state (persist middleware will handle localStorage)
          set({user: data.user, token: data.token});
        } catch (err) {
          console.error("Registration failed:", err);
          const errorMessage =
            err instanceof Error ? err.message : "Registration failed";
          throw new Error(errorMessage);
        }
      },
      logout: () => {
        set({user: null, token: ""});
      },
      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        try {
          // Use stored user's role or default to buyer
          const storedUser = get().user;
          const role = storedUser?.role || "buyer";

          const res = await fetch(`${API_URL}/${role}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const user = await res.json();
              set({user: {...user, role}});
            } else {
              get().logout();
            }
          } else {
            // Token invalid, clear it
            get().logout();
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          // Don't logout on network errors, keep stored data
        }
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
