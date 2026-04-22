import React from "react";
import Link from "next/link";
import styles from "./publicLayout.module.scss";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            SmartATS <span style={{ color: "#0ea5e9" }}>AI</span>
          </Link>

          <div className={styles.navLinks}>
            <Link href="/jobs">Việc làm</Link>
            <Link href="/companies">Công ty</Link>
            <Link href="/about">Về chúng tôi</Link>
          </div>

          <div className={styles.authButtons}>
            <Link href="/auth/login" className={styles.loginBtn}>
              Đăng nhập
            </Link>
            <Link href="/auth/register" className={styles.registerBtn}>
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content: Khu vực hiển thị nội dung trang (Jobs, v.v.) */}
      <main className={styles.mainContent}>{children}</main>

      {/* 3. Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerInfo}>
            <div className={styles.logo}>SmartATS AI</div>
            <p>
              Nền tảng tuyển dụng thông minh ứng dụng AI, <br />
              giúp kết nối ứng viên và nhà tuyển dụng hiệu quả nhất.
            </p>
          </div>

          <div>
            <h4 className={styles.footerTitle}>Ứng viên</h4>
            <ul className={styles.footerLinkList}>
              <li>
                <Link href="/jobs">Tìm việc làm</Link>
              </li>
              <li>
                <Link href="/candidate/profile">Hồ sơ của tôi</Link>
              </li>
              <li>
                <Link href="/candidate/ai-recommendations">Gợi ý AI</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerTitle}>Nhà tuyển dụng</h4>
            <ul className={styles.footerLinkList}>
              <li>
                <Link href="/hr/jobs/create">Đăng tin tuyển dụng</Link>
              </li>
              <li>
                <Link href="/hr/dashboard">Quản lý ứng viên</Link>
              </li>
              <li>
                <Link href="/about">Dịch vụ HR</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerTitle}>Pháp lý</h4>
            <ul className={styles.footerLinkList}>
              <li>
                <Link href="/privacy">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="/terms">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link href="/contact">Liên hệ</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} SmartATS AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
