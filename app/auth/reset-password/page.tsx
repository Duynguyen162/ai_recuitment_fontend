"use client";

import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../../../components/ui/InputField";
import Button from "../../../components/ui/Button";
import Link from "next/link";
import styles from "./reset-password.module.scss";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  // Logic kiểm tra lỗi
  const isMatch = confirmPassword === "" || password === confirmPassword;
  const passwordError = !isMatch ? "Mật khẩu xác nhận không khớp" : "";

  const isValid =
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          password,
          token,
        },
      );
      if (res.status === 200) {
        setIsSuccess(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.detail || "Token không hợp lệ hoặc đã hết hạn",
        );
      } else {
        alert("Không thể kết nối máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle={
        !isSuccess ? "Thiết lập mật khẩu mới cho tài khoản của bạn" : ""
      }
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit}>
          <InputField
            label="Mật khẩu mới"
            type="password"
            value={password}
            placeholder="Nhập ít nhất 6 ký tự..."
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            placeholder="Nhập lại mật khẩu mới..."
            error={passwordError}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div style={{ marginTop: "1rem" }}>
            <Button disabled={!isValid} loading={loading}>
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.successBox}>
          <p>Mật khẩu của bạn đã được thay đổi thành công!</p>
          <div className={styles.authLink}>
            <Link href="/auth/login">Đăng nhập ngay</Link>
          </div>
        </div>
      )}

      {!isSuccess && (
        <p className={styles.authLink}>
          Nhớ ra mật khẩu? <Link href="/auth/login">Quay lại đăng nhập</Link>
        </p>
      )}
    </AuthLayout>
  );
}
