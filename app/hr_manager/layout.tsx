"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Building2,
    Settings,
    LogOut,
    Menu,
    Crown,
    Sparkles,
    FileText,
    ShieldCheck,
} from "lucide-react";
import cx from "classnames";
import styles from "./EmployerLayout.module.scss";
import { useLogout } from "@/hooks/useLogout";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const handleLogout = useLogout();
    const { company, isVip, loading } = useCompanyProfile();

    const companyName = company.name || "Doanh nghiệp của bạn";
    const companyLogo = company.logo_url || null;
    const companyInitial = companyName.charAt(0).toUpperCase() || "D";
    const isApproved = company.verification_status === "approved";

    const menuItems = [
        { name: "Tổng quan", path: "/hr_manager/dashboard", icon: LayoutDashboard },
        { name: "Quản lý việc làm", path: "/hr_manager/jobs", icon: Briefcase },
        { name: "Hồ sơ ứng viên", path: "/hr_manager/candidates", icon: Users },
        { name: "Hồ sơ công ty", path: "/hr_manager/company", icon: Building2 },
        {
            name: "Tài liệu công ty",
            path: "/hr_manager/company_document",
            icon: FileText,
        },
        { name: "Gói dịch vụ", path: "/hr_manager/pricing", icon: Crown },
    ];

    return (
        <div className={styles.layoutContainer}>
            <aside
                className={cx(styles.sidebar, { [styles.closed]: !isSidebarOpen })}
            >
                <div className={styles.logoArea}>
                    <span className={styles.logoText}>
                        Smart ATS <span>HR</span>
                    </span>
                </div>

                <nav className={styles.navMenu}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.path || pathname.startsWith(`${item.path}/`);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cx(styles.navItem, { [styles.active]: isActive })}
                            >
                                <Icon size={20} className={styles.navIcon} />
                                <span className={styles.navLabel}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {!isVip && !loading && isSidebarOpen && (
                    <div className={styles.upsellVipBox}>
                        <div className={styles.vipIcon}>
                            <Sparkles size={20} />
                        </div>
                        <h4>Kích hoạt AI Matching</h4>
                        <p>
                            Mở khóa chấm điểm CV, nhận xét chi tiết và kho tài liệu nội bộ để
                            AI đưa vào vector DB.
                        </p>
                        <Link href="/hr_manager/pricing" className={styles.upgradeBtn}>
                            Nâng cấp VIP
                        </Link>
                    </div>
                )}

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfoMini}>
                        <div
                            className={cx(styles.userAvatar, { [styles.vipBorder]: isVip })}
                        >
                            {companyLogo ? (
                                <img src={companyLogo} alt={companyName} className={styles.logoImg} />
                            ) : (
                                companyInitial
                            )}
                        </div>
                        {isSidebarOpen && (
                            <div className={styles.userMeta}>
                                <span className={styles.userName}>{companyName}</span>
                                <span className={isVip ? styles.vipTag : styles.freeTag}>
                                    {loading
                                        ? "Đang tải..."
                                        : isVip
                                            ? "Gói VIP (AI)"
                                            : "Gói miễn phí"}
                                </span>
                                {isApproved && (
                                    <span className={styles.verifyTag}>
                                        <ShieldCheck size={12} />
                                        Đã xác minh
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <div className={styles.mainWrapper}>
                <header className={styles.topHeader}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.toggleBtn}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className={styles.pageTitle}>
                            {menuItems.find((item) => pathname.startsWith(item.path))?.name ||
                                "Bảng điều khiển"}
                        </h2>
                    </div>
                    <div className={styles.logoutArea}>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={20} />
                            {isSidebarOpen && <span>Đăng xuất</span>}
                        </button>
                    </div>
                </header>

                <main className={styles.pageContent}>{children}</main>
            </div>
        </div>
    );
}
