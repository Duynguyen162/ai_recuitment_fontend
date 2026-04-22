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
  Settings
} from "lucide-react";
import styles from "./CandidateSidebar.module.scss";

const menuItems = [
  { name: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { name: "Tìm việc làm", href: "/candidate/search_job", icon: Search },
  { name: "Hồ sơ của tôi", href: "/candidate/profile", icon: UserCircle },
  { name: "Đơn ứng tuyển", href: "/candidate/applications", icon: FileText },
  { name: "Job đã lưu", href: "/candidate/saved-jobs", icon: Bookmark },
  { name: "Công ty theo dõi", href: "/candidate/followed-companies", icon: Building2 },
  { name: "Gợi ý AI", href: "/candidate/ai-recommendations", icon: Sparkles },
  { name: "Thông báo", href: "/candidate/notifications", icon: Bell },
];

export default function CandidateSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <Link href="/" className={styles.logo}>
          SmartATS <span>AI</span>
        </Link>
      </div>

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
                className={cx(styles.menuItem, { [styles.active]: isActive })}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.footerMenu}>
          <Link 
            href="/candidate/settings" 
            className={cx(styles.menuItem, { [styles.active]: pathname === "/candidate/settings" })}
          >
            <Settings size={20} />
            <span>Cài đặt</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}