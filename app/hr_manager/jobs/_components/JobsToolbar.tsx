import { Search, X } from "lucide-react";
import cx from "classnames";

import styles from "../jobsManagement.module.scss";
import {
  JOB_STATUS_OPTIONS,
  type JobCounts,
  type JobStatus,
} from "../_lib/jobManagement";

interface JobsToolbarProps {
  counts: JobCounts;
  filterStatus: JobStatus;
  searchQuery: string;
  onFilterChange: (status: JobStatus) => void;
  onSearchChange: (value: string) => void;
}

export default function JobsToolbar({
  counts,
  filterStatus,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: JobsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filterGroup}>
        {JOB_STATUS_OPTIONS.map(([status, label]) => (
          <button
            key={status}
            className={cx(styles.filterBtn, {
              [styles.active]: filterStatus === status,
            })}
            onClick={() => onFilterChange(status)}
          >
            {label}
            {/* <span className={styles.countBadge}>{counts[status]}</span> */}
          </button>
        ))}
      </div>

      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, địa điểm, tag..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onSearchChange("")}
            title="Xóa tìm kiếm"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
