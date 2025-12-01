// src/props/stores/userStore.props.ts

// --- User Types ---
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
}

export interface UserStore {
  users: User[];
  fetchUsers: () => Promise<void>;
}



// --- Auth Types ---
export interface AuthStore {
  user: User | null;
  token: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
