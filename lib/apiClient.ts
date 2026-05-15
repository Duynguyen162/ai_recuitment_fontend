import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,// cho trình duyệt gửi cookie kèm req
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") { 
        useAuthStore.getState().logout();
        
        const pathname = window.location.pathname;
        const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/admin/login");
        
        // Chỉ redirect nếu đang ở trang bảo mật (candidate, hr_manager, admin)
        const isProtectedRoute = pathname.startsWith("/candidate") || 
                                 pathname.startsWith("/hr_manager") || 
                                 (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login"));
        
        if (!isAuthPage && isProtectedRoute) {
            window.location.href = "/auth/login";
        }
      } 
    }

    return Promise.reject(error);
  }
);

export default apiClient;