"use client";

import React, { useState, useEffect, useRef } from "react";
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
    Bell,
} from "lucide-react";
import cx from "classnames";
import styles from "./EmployerLayout.module.scss";
import { useLogout } from "@/hooks/useLogout";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import apiClient from "@/lib/apiClient";

interface Notification {
    id: number;
    user_id: number;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const handleLogout = useLogout();
    const { company, isVip, loading, hasNoCompany } = useCompanyProfile();

    // Notification state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

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

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await apiClient.get('/notifications/my');
                setNotifications(res.data.data || []);
            } catch (error) {
                console.error("Lỗi tải thông báo:", error);
            }
        };
        fetchNotifications();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReadNotification = async (id: number) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleReadAll = async () => {
        try {
            await apiClient.patch(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

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

                {isVip && !loading && isSidebarOpen && company.vip_remaining_days !== null && company.vip_remaining_days <= 5 && (
                    <div className={cx(styles.upsellVipBox, styles.warnBox)}>
                        <div className={styles.vipIcon} style={{ color: "#f43f5e" }}>
                            <Sparkles size={20} />
                        </div>
                        <h4 style={{ color: "#f43f5e" }}>Gói VIP sắp hết hạn</h4>
                        <p>
                            Chỉ còn {company.vip_remaining_days} ngày sử dụng. Gia hạn ngay để không bị gián đoạn tính năng AI.
                        </p>
                        <Link href="/hr_manager/pricing" className={styles.renewBtn}>
                            Gia hạn gói VIP
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
                                            ? company.vip_remaining_days && company.vip_remaining_days > 0
                                                ? `Gói VIP (Còn ${company.vip_remaining_days} ngày)`
                                                : "Gói VIP (AI)"
                                            : "Gói miễn phí"}
                                </span>
                                {isVip && company.vip_remaining_days !== null && company.vip_remaining_days <= 5 && (
                                    <span className={styles.vipWarningTag}>
                                        ⚠️ Sắp hết hạn!
                                    </span>
                                )}
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
                        {/* Notification Bell */}
                        <div className={styles.notifWrapper} ref={notifRef}>
                            <button
                                className={styles.notiBtn}
                                onClick={() => setNotifOpen(!notifOpen)}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className={styles.badge}>{unreadCount}</span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className={styles.notifDropdown}>
                                    <div className={styles.notifHeader}>
                                        <span>Thông báo</span>
                                        {unreadCount > 0 && (
                                            <button className={styles.markAllBtn} onClick={handleReadAll}>
                                                Đã đọc tất cả
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.notifList}>
                                        {notifications.length === 0 ? (
                                            <div className={styles.notifEmpty}>Không có thông báo nào</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={cx(styles.notifItem, { [styles.unread]: !n.is_read })}
                                                    onClick={() => {
                                                        if (!n.is_read) handleReadNotification(n.id);
                                                    }}
                                                >
                                                    <div className={styles.notifTitle}>{n.title}</div>
                                                    <div className={styles.notifBody}>{n.body}</div>
                                                    <div className={styles.notifTime}>
                                                        {new Date(n.created_at).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={20} />
                            {isSidebarOpen && <span>Đăng xuất</span>}
                        </button>
                    </div>
                </header>

                {company.verification_status === "locked" && (
                    <div className={styles.lockBanner}>
                        ⚠️ Tài khoản công ty của bạn đang bị khóa bởi Ban quản trị và không thể đăng bài tuyển dụng mới.
                    </div>
                )}

                {company.verification_status === "rejected" && (
                    <div className={styles.lockBanner} style={{ backgroundColor: "#fef2f2", borderBottom: "1px solid #fee2e2", color: "#b91c1c" }}>
                        <span>❌ Giấy phép kinh doanh của bạn bị từ chối duyệt. Vui lòng cập nhật và gửi yêu cầu xác minh lại để tiếp tục sử dụng dịch vụ.</span>
                        <Link href="/hr_manager/company" style={{ marginLeft: "auto", textDecoration: "underline", fontWeight: 700 }}>
                            Cập nhật ngay
                        </Link>
                    </div>
                )}

                {company.verification_status === "pending" && (
                    <div className={styles.lockBanner} style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fef3c7", color: "#d97706" }}>
                        <span>⏳ Hồ sơ công ty đang chờ duyệt. Vui lòng đợi Ban quản trị xác minh giấy phép kinh doanh của bạn.</span>
                        <Link href="/hr_manager/company" style={{ marginLeft: "auto", textDecoration: "underline", fontWeight: 700 }}>
                            Xem hồ sơ
                        </Link>
                    </div>
                )}

                {hasNoCompany && (
                    <div className={styles.lockBanner} style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fef3c7", color: "#d97706" }}>
                        <span>⚠️ Bạn cần cập nhật hồ sơ công ty để đăng tuyển.</span>
                        <Link href="/hr_manager/company" style={{ marginLeft: "auto", textDecoration: "underline", fontWeight: 700 }}>
                            Cập nhật hồ sơ
                        </Link>
                    </div>
                )}
 
                 <main className={styles.pageContent}>{children}</main>
            </div>
        </div>
    );
}
