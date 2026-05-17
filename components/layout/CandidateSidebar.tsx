"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import cx from "classnames";
import {
    LayoutDashboard,
    Search,
    UserCircle,
    FileText,
    Bookmark,
    Building2,
    Sparkles,
    Bell,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import styles from "./CandidateSidebar.module.scss";

const menuItems = [
    { name: "Tìm việc làm", href: "/candidate/search_job", icon: Search },
    { name: "Hồ sơ của tôi", href: "/candidate/profile", icon: UserCircle },
    {
        name: "Đơn ứng tuyển",
        href: "/candidate/job_applications",
        icon: FileText,
    },
    { name: "Job đã lưu", href: "/candidate/save_job", icon: Bookmark },
    {
        name: "Công ty theo dõi",
        href: "/candidate/followed_companies",
        icon: Building2,
    },
];

export default function CandidateSidebar({
    isOpen,
    onToggle,
}: {
    isOpen: boolean;
    onToggle: () => void;
}) {
    const pathname = usePathname();

    return (
        <aside
            className={cx(styles.sidebar, {
                [styles.collapsed]: !isOpen,
            })}
        >
            <Link href="/candidate/search_job" className={styles.logo}>
                SmartATS <span>AI</span>
            </Link>

            <nav className={styles.navMenu}>
                <div className={styles.menuGroup}>
                    <p className={styles.groupTitle}>Menu chính</p>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!isOpen ? item.name : ""}
                                className={cx(styles.menuItem, {
                                    [styles.active]: isActive,
                                })}
                            >
                                <Icon size={20} />
                                <span className={styles.label}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* FOOTER TOGGLE */}
            <div className={styles.footer}>
                <button onClick={onToggle} className={styles.toggleBtn}>
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>
        </aside>
    );
}
