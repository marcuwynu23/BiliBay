// src/stores/buyer/userStore.ts
import {create} from "zustand";
import type {User, UserStore} from "~/props/stores/userStore.props";

export const useBuyerUserStore = create<UserStore>((set) => ({
  users: [],
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/buyer/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data: User[] = await res.json();
      set({users: Array.isArray(data) ? data : [data]}); // wrap single user in array
    } catch (err) {
      console.error("Failed to fetch buyer profile:", err);
    }
  },
}));
