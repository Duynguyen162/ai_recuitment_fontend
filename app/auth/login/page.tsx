"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/apiClient";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import SocialLogin from "../components/SocialLogin";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { login } = useAuthStore();
  const valid = email.length > 3 && password.length > 3;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { id, email: userEmail, role, token } = res.data.data;

      // Lưu vào Zustand + localStorage
      login({ id, email: userEmail, role }, token);

      // Set cookie để Next.js middleware đọc được
      document.cookie = `role=${role}; path=/; max-age=86400`;

      // 3. Điều hướng
      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        router.push(`/${role}/dashboard`);
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.detail ?? "Đã xảy ra lỗi, vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại">
      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div
            style={{
              color: "#ef4444",
              backgroundColor: "#fef2f2",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              textAlign: "center",
              border: "1px solid #fecaca",
            }}
          >
            {errorMsg}
          </div>
        )}
        <InputField
          label="Email"
          type="email"
          value={email}
          placeholder="Nhập địa chỉ email..."
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMsg("");
          }}
        />
        <InputField
          label="Mật khẩu"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMsg("");
          }}
        />
        <div className={styles.loginOptions}>
          <Link href="/auth/forgot-password">Quên mật khẩu?</Link>
        </div>
        <Button disabled={!valid} loading={loading}>
          Đăng nhập
        </Button>
      </form>
      <SocialLogin />
      <p className={styles.authLink}>
        Chưa có tài khoản? <Link href="/auth/register">Đăng ký ngay</Link>
      </p>
    </AuthLayout>
  );
}
