"use client";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import { useLogout } from "@/hooks/useLogout";

export default function DashboardPage() {
  const logout = useLogout();

  const handleLogout = async () => {
    logout();
    redirect("/auth/login");
  };
  return (
    <div>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}
