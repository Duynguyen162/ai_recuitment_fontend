// hooks/useLogout.ts
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const { logout ,user } = useAuthStore();

  return async () => {
     const currentRole = user?.role;
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();

      if (currentRole === "admin") {
        router.push("/admin/login");
      } else {
        router.push("/auth/login");
      }
    }
  };
}
