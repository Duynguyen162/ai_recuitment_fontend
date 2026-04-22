"use client";

import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../../../components/ui/InputField"; // Import từ file riêng
import Button from "../../../components/ui/Button";
import Link from "next/link";
import styles from "./register.module.scss";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/validations/auth.schema";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      role: "candidate",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/register",
        {
          email: data.email,
          password: data.password,
          role: data.role,
        },
      );

      alert("Đăng ký thành công!");
      router.push("/auth/login");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.detail && Array.isArray(data.detail)) {
          data.detail.forEach((err: any) => {
            const field = err.loc[1] as keyof RegisterInput;
            setError(field, { message: err.msg });
          });
        } else {
          alert(data?.detail || "Đã xảy ra lỗi");
        }
      } else {
        alert("Không thể kết nối máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  // Trả về giao diện chính của trang Đăng ký
  return (
    <AuthLayout title="Đăng ký" subtitle="Tạo tài khoản mới của bạn">
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Email"
          type="email"
          placeholder="Nhập địa chỉ email..."
          error={errors.email?.message}
          {...register("email")}
        />

        <InputField
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <InputField
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className={styles.inputGroup}>
          <label htmlFor="role">Vai trò</label>
          <select id="role" className={styles.input} {...register("role")}>
            <option value="candidate">Ứng viên</option>
            <option value="hr_manager">Nhà tuyển dụng</option>
          </select>
          {errors.role && (
            <p className={styles.errorText}>{errors.role.message}</p>
          )}
        </div>

        <Button disabled={!isValid} loading={loading}>
          Đăng ký
        </Button>
      </form>

      <p className={styles.authLink}>
        Đã có tài khoản?
        <Link href="/auth/login"> Đăng nhập</Link>
      </p>
    </AuthLayout>
  );
}
