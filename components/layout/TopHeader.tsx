"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown } from "lucide-react";
import styles from "./TopHeader.module.scss";
import { useLogout } from "@/hooks/useLogout";
import { useRouter } from "next/navigation";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logout = useLogout();
  const router = useRouter();

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}></div>

      <div className={styles.rightSection}>
        <button className={styles.notificationBtn}>
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
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