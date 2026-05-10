"use client";

import React from "react";
import cx from "classnames";
import { Briefcase, Users, Calendar, Activity } from "lucide-react";
import styles from "../dashboard.module.scss";
import { DashboardStats } from "../_lib/types";

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={cx(styles.iconWrapper, styles.blue)}>
          <Briefcase size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Tin đang tuyển</span>
          <span className={styles.statValue}>{stats.activeJobs}</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={cx(styles.iconWrapper, styles.green)}>
          <Users size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Ứng viên mới 7 ngày</span>
          <span className={styles.statValue}>{stats.newApplicants}</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={cx(styles.iconWrapper, styles.purple)}>
          <Calendar size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Phỏng vấn hôm nay</span>
          <span className={styles.statValue}>{stats.interviewsToday}</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={cx(styles.iconWrapper, styles.orange)}>
          <Activity size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Tỷ lệ phản hồi</span>
          <span className={styles.statValue}>{stats.responseRate}%</span>
        </div>
      </div>
    </div>
  );
}
