"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";

/**
 * AuthSync Component
 * Nhiệm vụ: Đồng bộ thông tin người dùng từ Backend vào Zustand Store ngay khi ứng dụng khởi chạy.
 * Giúp tránh việc gọi API /me lặp lại ở nhiều nơi.
 */
export default function AuthSync() {
    const fetchUser = useAuthStore((state) => state.fetchUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const pathname = usePathname();

    useEffect(() => {
        // Danh sách các trang không cần đồng bộ (trang đăng nhập, đăng ký)
        const isAuthPage = pathname.startsWith("/auth") || pathname.startsWith("/admin/login");

        // Chỉ gọi API nếu chưa được xác thực và KHÔNG phải ở trang login
        if (!isAuthenticated && !isAuthPage) {
            fetchUser();
        }
    }, [fetchUser, isAuthenticated, pathname]);

    return null;
}
