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

    if (status === 429) {
      if (typeof window !== "undefined") {
        const toast = require("react-hot-toast").default;
        const detailMessage = error.response?.data?.detail || "Bạn đã vượt quá giới hạn sử dụng AI hôm nay. Hạn mức sẽ được làm mới vào ngày mai.";
        toast.error(detailMessage, {
          duration: 5000,
          position: "top-center"
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;