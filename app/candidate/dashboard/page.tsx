"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất nếu backend có
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/auth/login");
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}
