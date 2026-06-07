"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng người dùng về trang bảng giá vì không còn dùng callback kiểu cũ
    router.replace("/hr_manager/pricing");
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", color: "#64748b" }}>
      Đang chuyển hướng...
    </div>
  );
}
