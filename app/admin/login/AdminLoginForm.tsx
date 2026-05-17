"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import axios from "axios";
import styles from "./adminLogin.module.scss";

type AdminLoginFormProps = {
    redirectUrl?: string;
};

export default function AdminLoginForm({ redirectUrl }: AdminLoginFormProps) {
    const router = useRouter();
    const { login, logout } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const valid = email.length > 3 && password.length > 3;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const res = await apiClient.post(
                "/auth/admin/login",
                { email, password },
            );

            const { id, email: userEmail, role } = res.data.data;

            login({ id, email: userEmail, role });

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                window.location.href = "/admin/dashboard";
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErrorMsg(
                    error.response?.data?.detail ?? "Đã xảy ra lỗi khi đăng nhập Admin!",
                );
            } else {
                setErrorMsg("Không thể kết nối máy chủ quản trị");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {errorMsg && (
                <div className={styles.errorAlert}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errorMsg}
                </div>
            )}

            <div className={styles.inputGroup}>
                <InputField
                    label="Admin Email"
                    type="email"
                    value={email}
                    placeholder="admin@system.com"
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                    }}
                />
            </div>

            <div className={styles.inputGroup}>
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
            </div>

            <div className={styles.securityNote}>
                <p>Mọi hành động truy cập trái phép sẽ được ghi lại nhật ký hệ thống.</p>
            </div>

            <Button
                disabled={!valid}
                loading={loading}
                type="submit"
                variant="primary"
                className={styles.submitBtn}
            >
                Xác thực Quản trị viên
            </Button>
        </form>
    );
}
