import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/apiClient";

interface User {
  id: number;
  email: string;
  role: "candidate" | "hr_manager" | "admin";
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>; // Hàm đồng bộ thông tin từ Backend
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => set({ user: userData, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      fetchUser: async () => {
        try {
          const res = await apiClient.get("/auth/me");
          if (res.data?.data) {
            set({ user: res.data.data, isAuthenticated: true });
          }
        } catch (error) {
          // Nếu API /me lỗi (ví dụ token hết hạn), thực hiện logout
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: "auth-storage" }
  )
);
