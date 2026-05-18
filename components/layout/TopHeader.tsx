"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useRouter, usePathname } from "next/navigation";
import apiClient from "@/lib/apiClient";
import cx from "classnames";
import styles from "./TopHeader.module.scss";

interface TopHeaderProps {
    role: "candidate" | "hr" | "admin";
    userName?: string;
    avatarUrl?: string;
    onToggleSidebar?: () => void;
}

export default function TopHeader({
    role,
    userName = "Người dùng",
    avatarUrl,
}: TopHeaderProps) {
    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const logout = useLogout();
    const router = useRouter();
    const pathname = usePathname();

    const getPageTitle = (path: string) => {
        if (!path) return "Trang chủ";
        if (path.startsWith("/candidate/search_job")) return "Khám phá việc làm";
        if (path.startsWith("/candidate/job_detail")) return "Chi tiết công việc";
        if (path.startsWith("/candidate/job_applications")) return "Đơn ứng tuyển của tôi";
        if (path.startsWith("/candidate/profile")) return "Hồ sơ cá nhân";
        if (path.startsWith("/candidate/companies") && path.length > "/candidate/companies".length + 1) return "Chi tiết công ty";
        if (path.startsWith("/candidate/followed_companies")) return "Công ty đang theo dõi";
        if (path.startsWith("/candidate/save_job")) return "Việc làm đã lưu";

        // HR
        if (path.startsWith("/hr_manager/candidates")) return "Quản lý ứng viên";
        if (path.startsWith("/hr_manager/jobs")) return "Quản lý tin tuyển dụng";
        if (path.startsWith("/hr_manager/dashboard")) return "Tổng quan (Dashboard)";

        return "Trang chủ";
    };

    useEffect(() => {
        if (role === 'candidate') {
            const fetchNotifications = async () => {
                try {
                    const res = await apiClient.get('/notifications/my');
                    setNotifications(res.data.data);
                    setUnreadCount(res.data.data.filter((n: any) => !n.is_read).length);
                } catch (error) {
                    console.error(error);
                }
            };
            fetchNotifications();
        }
    }, [role]);

    const handleReadNotification = async (id: number) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleReadAll = async () => {
        try {
            await apiClient.put(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
            if (
                notifRef.current &&
                !notifRef.current.contains(event.target as Node)
            ) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <div className={styles.pageTitle}>
                    {getPageTitle(pathname)}
                </div>
            </div>

            <div className={styles.rightSection}>
                {role === "candidate" ? (
                    <div className={styles.notificationWrapper} ref={notifRef}>
                        <button className={styles.notificationBtn} onClick={() => setNotifOpen(!notifOpen)}>
                            <Bell size={20} />
                            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                        </button>
                        {notifOpen && (
                            <div className={styles.notificationDropdown}>
                                <div className={styles.notifHeader}>
                                    <span style={{ color: 'black' }}>Thông báo</span>
                                    {unreadCount > 0 && (
                                        <button className={styles.markAllBtn} onClick={handleReadAll}>Đánh dấu đã đọc tất cả</button>
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
                                                <div className={styles.notifMsg}>{n.message}</div>
                                                <div className={styles.notifTime}>{new Date(n.created_at).toLocaleString('vi-VN')}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className={styles.notificationBtn}>
                        <Bell size={20} />
                        <span className={styles.badge}>3</span>
                    </button>
                )}
                <div className={styles.userWrapper} ref={dropdownRef}>
                    <div
                        className={styles.userProfile}
                        onClick={() => setOpen(!open)}
                    >
                        <img
                            src={
                                avatarUrl ||
                                "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            }
                            alt="Avatar"
                            className={styles.avatar}
                        />
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{userName}</span>
                            <span className={styles.userRole}>
                                {role === "candidate" ? "Ứng viên" : "Nhà tuyển dụng"}
                            </span>
                        </div>
                        <ChevronDown size={16} />
                    </div>
                    {open && (
                        <div className={styles.dropdown}>
                            <button
                                className={styles.dropdownItem}
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}