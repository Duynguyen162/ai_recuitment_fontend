// hooks/useLogout.ts
import { useAuthStore } from "@/store/authStore";
import { deleteCookies } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return () => {
    logout();
    deleteCookies();
    router.push("/auth/login");
  };
}
