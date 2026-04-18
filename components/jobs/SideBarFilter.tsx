"use client";

import React, { useState } from "react";
import styles from "./SideBarFilter.module.scss";

export interface FilterParams {
  location: string;
  jobType: string;
  experience: string;
}

interface SidebarFilterProps {
  initialFilters: FilterParams;
  onApplyFilter: (filters: FilterParams) => void;
  onClearFilter: () => void;
}

export default function SideBarFilter({
  initialFilters,
  onApplyFilter,
  onClearFilter,
}: SidebarFilterProps) {
  const [filters, setFilters] = useState<FilterParams>(initialFilters);

  const handleApply = () => {
    onApplyFilter(filters);
  };

  const handleClear = () => {
    const emptyFilters = { location: "", jobType: "", experience: "" };
    setFilters(emptyFilters);
    onClearFilter();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Bộ lọc tìm kiếm</h2>
        <button onClick={handleClear} className={styles.clearBtn}>
          Xóa tất cả
        </button>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Địa điểm làm việc</label>
        <select
          className={styles.selectField}
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option value="">Tất cả địa điểm</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
          <option value="Remote">Làm từ xa (Remote)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Hình thức làm việc</label>
        <div className={styles.radioList}>
          {["full_time", "part_time", "remote"].map((type) => (
            <label key={type} className={styles.radioOption}>
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={(e) =>
                  setFilters({ ...filters, jobType: e.target.value })
                }
              />
              <span>
                {type === "full_time"
                  ? "Toàn thời gian"
                  : type === "part_time"
                    ? "Bán thời gian"
                    : "Từ xa"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Kinh nghiệm yêu cầu</label>
        <input
          type="number"
          min={0}
          placeholder="VD: 2 năm"
          className={styles.inputField}
          value={filters.experience}
          onChange={(e) =>
            setFilters({ ...filters, experience: e.target.value })
          }
        />
      </div>

      <div className={styles.actionBox}>
        <button onClick={handleApply} className={styles.applyBtn}>
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
}
