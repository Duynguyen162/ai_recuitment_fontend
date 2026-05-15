"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Bot,
  LogOut,
  Menu,
  Shield,
  Users,
} from "lucide-react";
import cx from "classnames";
import { useLogout } from "@/hooks/useLogout";
import styles from "./AdminLayout.module.scss";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleLogout = useLogout();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Công ty", path: "/admin/companies", icon: Building2 },
    { name: "Kiểm duyệt Job", path: "/admin/jobs", icon: Briefcase },
    { name: "Ứng viên", path: "/admin/candidates", icon: Users },
    { name: "AI Monitoring", path: "/admin/ai-monitoring", icon: Bot },
  ];

  const pageTitle = menuItems.find((m) => pathname.startsWith(m.path))?.name ?? "Admin";

  // Không hiển thị sidebar/header cho trang login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <aside className={cx(styles.sidebar, { [styles.closed]: !sidebarOpen })}>
        <div className={styles.brand}>
          <Shield size={22} className={styles.brandIcon} />
          {sidebarOpen && <span>Smart ATS <strong>Admin</strong></span>}
        </div>

        <nav className={styles.nav}>
          {menuItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={cx(styles.navItem, {
                [styles.active]: pathname === path || pathname.startsWith(path + "/"),
              })}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{name}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.footerArea}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className={styles.body}>
        <header className={styles.header}>
          <button className={styles.toggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={22} />
          </button>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
