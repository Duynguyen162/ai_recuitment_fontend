"use client";

import cx from "classnames";
import { useState } from "react";

import { HrJob } from "../_lib/types";
import styles from "../candidates.module.scss";

interface JobSidebarProps {
  jobs: HrJob[];
  jobsLoading: boolean;
  selectedJobId: number | "all";
  onSelectJob: (jobId: number | "all") => void;
}

type JobFilter = "published" | "paused" | "closed";

export default function JobSidebar({
  jobs,
  jobsLoading,
  selectedJobId,
  onSelectJob,
}: JobSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<JobFilter>("published");

  const filteredJobs = jobs.filter((j) => {
    const s = j.status?.toLowerCase() || "";
    if (activeFilter === "published") return s === "published";
    if (activeFilter === "paused") return s === "paused";
    if (activeFilter === "closed") return s === "closed";
    return false;
  });

  return (
    <aside className={styles.jobPanel}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Danh sách job</span>
          <h2>Chọn job cần xem</h2>
        </div>
      </div>

      <div className={styles.sidebarTabs}>
        <button
          className={cx(styles.sidebarTabBtn, { [styles.active]: activeFilter === "published" })}
          onClick={() => setActiveFilter("published")}
        >
          Đang HĐ
        </button>
        <button
          className={cx(styles.sidebarTabBtn, { [styles.active]: activeFilter === "paused" })}
          onClick={() => setActiveFilter("paused")}
        >
          Tạm dừng
        </button>
        <button
          className={cx(styles.sidebarTabBtn, { [styles.active]: activeFilter === "closed" })}
          onClick={() => setActiveFilter("closed")}
        >
          Đã đóng
        </button>
      </div>

      <div className={styles.jobList}>
        {jobsLoading ? (
          <div className={styles.infoCard}>Đang tải danh sách job...</div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.infoCard}>
            Không có job nào.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className={cx(styles.jobCard, {
                [styles.activeJob]: selectedJobId === job.id,
              })}
              onClick={() => onSelectJob(job.id)}
            >
              <div className={styles.jobCardTop}>
                <strong className={styles.jobTitleText} title={job.title}>{job.title}</strong>
              </div>
              <p className={styles.jobLocationText}>{job.location}</p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
