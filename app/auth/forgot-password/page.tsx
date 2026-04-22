"use client";

import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../../../components/ui/InputField";
import Button from "../../../components/ui/Button";
import Link from "next/link";
import styles from "./forgot-password.module.scss";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // Trạng thái đã gửi email thành công

  const valid = email.length > 3;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email },
      );
      if (res.status === 200) {
        setIsSent(true);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi");
      console.error(error);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle={!isSent ? "Lấy lại quyền truy cập tài khoản của bạn" : ""}
    >
      {!isSent ? (
        <form onSubmit={handleSubmit}>
          <p className={styles.description}>
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi cho bạn một
            liên kết để đặt lại mật khẩu.
          </p>

          <InputField
            label="Email"
            type="email"
            value={email}
            placeholder="Nhập địa chỉ email..."
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button disabled={!valid} loading={loading}>
            Gửi liên kết xác nhận
          </Button>
        </form>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p
            className={styles.description}
            style={{ color: "#059669", fontWeight: 500 }}
          >
            Đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Vui
            lòng kiểm tra hộp thư đến của bạn.
          </p>
        </div>
      )}

      <p className={styles.authLink}>
        <Link href="/auth/login">
          {/* Mũi tên quay lại */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
