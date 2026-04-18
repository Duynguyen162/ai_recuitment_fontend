"use client";

import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import SocialLogin from "../components/SocialLogin";
import styles from "./login.module.scss";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = email.length > 3 && password.length > 3;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      });
      if (res.status === 200) {
        router.push("/candidate/dashboard");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại">
      <form onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          placeholder="Nhập địa chỉ email..."
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Mật khẩu"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
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
