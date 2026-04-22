import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Tự động gắn "Authorization: Bearer <token>" vào mọi request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động logout khi token hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      deleteCookies();
      window.location.replace("/auth/login");
    }
    return Promise.reject(error);
  }
);

// Xóa cookies khi logout
export function deleteCookies() {
  document.cookie = "role=; path=/; max-age=0";
}

export default apiClient;