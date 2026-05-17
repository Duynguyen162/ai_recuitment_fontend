"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./home.module.scss";
import JobSearchBar from "@/components/jobs/JobSearchBar";

export default function LandingPage() {
    const router = useRouter();

    const handleSearch = (query: string) => {
        // Chuyển hướng sang trang tìm kiếm kèm theo từ khóa
        router.push(`/public/jobs?keyword=${encodeURIComponent(query)}`);
    };

    return (
        <div className={styles.wrapper}>
            {/* Tiêu điểm của trang chủ  */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Tuyển dụng thông minh với sức mạnh AI</h1>
                    <p>
                        Kết nối ứng viên tài năng và doanh nghiệp hàng đầu thông qua hệ
                        thống phân tích hồ sơ tự động và khớp lệnh thông minh.
                    </p>
                    <div className={styles.searchWrapper}>
                        <JobSearchBar onSearch={handleSearch} />
                    </div>
                </div>
            </section>
            {/* content */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Hệ sinh thái SmartATS</h2>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>10k+</h3>
                        <p>Ứng viên</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>500+</h3>
                        <p>Doanh nghiệp</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>2k+</h3>
                        <p>Việc làm mới</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>95%</h3>
                        <p>Tỉ lệ khớp AI</p>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className={styles.ctaGrid}>
                    {/* Dành cho Ứng viên */}
                    <div className={styles.ctaCard}>
                        <h2>Dành cho Ứng viên</h2>
                        <p>
                            Xây dựng hồ sơ chuẩn hóa và nhận gợi ý việc làm phù hợp nhất từ
                            AI.
                        </p>
                        <Link
                            href="/public/jobs"
                            style={{
                                backgroundColor: "#1e40af",
                                color: "white",
                                padding: "0.75rem 2rem",
                                borderRadius: "8px",
                                fontWeight: 600,
                            }}
                        >
                            Tìm việc ngay
                        </Link>
                    </div>

                    {/* Dành cho Nhà tuyển dụng */}
                    <div className={styles.ctaCard}>
                        <h2>Dành cho Nhà tuyển dụng</h2>
                        <p>
                            Đăng tin tuyển dụng và trải nghiệm hệ thống ATS quản lý ứng viên
                            thông minh.
                        </p>
                        <Link
                            href="/auth/register"
                            style={{
                                border: "2px solid #1e40af",
                                color: "#1e40af",
                                padding: "0.75rem 2rem",
                                borderRadius: "8px",
                                fontWeight: 600,
                            }}
                        >
                            Đăng tin tuyển dụng
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
