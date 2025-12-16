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
    firstName: string,
    middleName: string | undefined,
    lastName: string,
    birthday: string | undefined,
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
        firstName: string,
        middleName: string | undefined,
        lastName: string,
        birthday: string | undefined,
        email: string,
        password: string,
        role: string,
        phone?: string
      ) => {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              firstName,
              middleName,
              lastName,
              birthday,
              email,
              password,
              role,
              phone,
            }),
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
        // Clear state and localStorage
        set({user: null, token: ""});
        // Explicitly clear localStorage to ensure persistence is removed
        localStorage.removeItem("auth-storage");
      },
      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        try {
          // Use stored user's role or default to buyer
          const storedUser = get().user;
          if (!storedUser || !storedUser.role) {
            // If no user data, we can't determine the role, so skip check
            // This shouldn't happen if login/register worked correctly
            console.warn("No user data found, skipping auth check");
            return;
          }

          const role = storedUser.role;
          const res = await fetch(`${API_URL}/${role}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const user = await res.json();
              // Update user data while preserving the token
              set({user: {...user, role}});
            }
          } else if (res.status === 401) {
            // Token invalid or expired
            // Try to read error message to confirm it's an auth error
            try {
              const contentType = res.headers.get("content-type");
              let errorText = "";
              if (contentType && contentType.includes("application/json")) {
                const errorData = await res.json();
                errorText = errorData.error || JSON.stringify(errorData);
              } else {
                errorText = await res.text();
              }
              
              // Check if it's definitely an auth error
              const isAuthError = errorText.includes("Unauthorized") || 
                                 errorText.includes("Invalid token") || 
                                 errorText.includes("expired") ||
                                 errorText.includes("token") ||
                                 errorText.toLowerCase().includes("authentication");
              
              if (isAuthError) {
                console.error("Token invalid or expired, logging out");
                // Clear the token and user, but don't clear localStorage immediately
                // This allows the user to see they need to log in again
                set({user: null, token: ""});
                // Clear localStorage after a short delay to allow redirect
                setTimeout(() => {
                  localStorage.removeItem("auth-storage");
                }, 100);
              } else {
                // Might be a server error, keep the token
                console.warn("Received 401 but error message unclear, keeping token:", errorText);
              }
            } catch (parseErr) {
              // If we can't parse the error, assume it's an auth error
              console.error("Token invalid or expired (could not parse error), logging out");
              set({user: null, token: ""});
              setTimeout(() => {
                localStorage.removeItem("auth-storage");
              }, 100);
            }
          } else if (res.status === 403) {
            // Forbidden - role mismatch, clear it
            console.error("Role mismatch, logging out");
            get().logout();
          }
          // For other status codes, don't clear - might be temporary server issues
        } catch (err) {
          console.error("Auth check failed:", err);
          // Don't logout on network errors, keep stored data
          // Only logout on actual auth failures (401/403)
          // This ensures login data persists even if there's a temporary network issue
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
