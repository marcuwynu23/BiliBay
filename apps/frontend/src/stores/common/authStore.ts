import {create} from "zustand";
import type {AuthStore} from "~/props/stores/userStore.props";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token") || "",
  login: async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });
      const data = await res.json();
      set({user: data.user, token: data.token});
      localStorage.setItem("token", data.token);
    } catch (err) {
      console.error("Login failed:", err);
    }
  },
  logout: () => {
    set({user: null, token: ""});
    localStorage.removeItem("token");
  },
}));
