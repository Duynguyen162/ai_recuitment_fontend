"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

import { useAuthStore } from "@/store/authStore";

import InputField from "../../../components/ui/InputField";
import Button from "../../../components/ui/Button";
import SocialLogin from "../components/SocialLogin";
import styles from "./login.module.scss";
import axios from "axios";

type LoginFormProps = {
    redirectUrl?: string;
};

export default function LoginForm({ redirectUrl }: LoginFormProps) {
    const router = useRouter();
    const { login } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const valid = email.length > 3 && password.length > 3;

    // LoginForm.tsx
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";

            const res = await apiClient.post(
                "/auth/login",
                { email, password },
            );
            const { id, email: userEmail, role } = res.data.data;

            login({ id, email: userEmail, role });

            // role cookie có thể giữ lại để UI check nhanh (không dùng để auth)
            document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else if (role === "candidate") {
                window.location.href = "/candidate/search_job";
            } else {
                window.location.href = `/${role}/dashboard`;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErrorMsg(
                    error.response?.data?.detail ?? "Đã xảy ra lỗi, vui lòng thử lại!",
                );
            } else {
                setErrorMsg("Không thể kết nối máy chủ");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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
                <Button disabled={!valid} loading={loading} type="submit">
                    Đăng nhập
                </Button>
            </form>
            <SocialLogin />
            <p className={styles.authLink}>
                Chưa có tài khoản? <Link href="/auth/register">Đăng ký ngay</Link>
            </p>
        </>
    );
}
