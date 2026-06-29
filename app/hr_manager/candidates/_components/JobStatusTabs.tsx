"use client";

import cx from "classnames";
import styles from "../candidates.module.scss";

export type JobStatusFilter = "published" | "paused" | "closed";

interface JobStatusTabsProps {
  activeStatus: JobStatusFilter;
  counts: { published: number; paused: number; closed: number };
  onChange: (status: JobStatusFilter) => void;
}

const TABS: { key: JobStatusFilter; label: string }[] = [
  { key: "published", label: "Đang hoạt động" },
  { key: "paused", label: "Tạm dừng" },
  { key: "closed", label: "Đã đóng" },
];

export default function JobStatusTabs({
  activeStatus,
  counts,
  onChange,
}: JobStatusTabsProps) {
  return (
    <div className={styles.jobStatusTabBar}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={cx(styles.jobStatusTab, {
            [styles.jobStatusTabActive]: activeStatus === tab.key,
          })}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          <span className={styles.jobStatusTabBadge}>{counts[tab.key]}</span>
        </button>
      ))}
    </div>
  );
}
