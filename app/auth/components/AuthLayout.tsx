"use client";
import styles from "./AuthLayout.module.scss";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <h1>Hệ thống tuyển dụng</h1>
        <p>Tìm kiếm công việc mơ ước của bạn hoặc thuê những tài năng tốt nhất.</p>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h2>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}