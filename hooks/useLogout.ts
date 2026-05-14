// hooks/useLogout.ts
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      document.cookie =
        "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";

      router.push("/auth/login");
    }
  };
}
