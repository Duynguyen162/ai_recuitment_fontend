"use client";

import React from "react";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
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
  onToggleSidebar,
}: TopHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}></div>
      {/* thông báo */}
      <div className={styles.rightSection}>
        <button className={styles.notificationBtn} aria-label="Thông báo">
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
        {/* Thông tin User */}
        <div className={styles.userProfile}>
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
          <ChevronDown size={16} color="#6b7280" />
        </div>
      </div>
    </header>
  );
}
